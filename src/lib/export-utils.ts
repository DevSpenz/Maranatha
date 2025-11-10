import { format } from "date-fns";

/**
 * Converts an array of objects into a CSV string and triggers a download.
 * Handles nested objects by flattening them into dot notation keys.
 * Handles Date objects by formatting them.
 */
export function exportToCsv<T extends Record<string, any>>(data: T[], filename: string) {
    if (data.length === 0) {
        console.warn("No data to export.");
        return;
    }

    // 1. Flatten objects and format dates
    const flattenedData = data.map(item => {
        const flatItem: Record<string, any> = {};
        for (const key in item) {
            if (item.hasOwnProperty(key)) {
                const value = item[key];
                if (value instanceof Date) {
                    flatItem[key] = format(value, 'yyyy-MM-dd HH:mm:ss');
                } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    // Simple flattening for nested objects (e.g., groups.name)
                    for (const subKey in value) {
                        if (value.hasOwnProperty(subKey)) {
                            flatItem[`${key}.${subKey}`] = value[subKey];
                        }
                    }
                } else {
                    flatItem[key] = value;
                }
            }
        }
        return flatItem;
    });

    // 2. Extract headers (keys from the first flattened object)
    const headers = Object.keys(flattenedData[0]);
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of flattenedData) {
        const values = headers.map(header => {
            const value = row[header];
            // Escape quotes and handle null/undefined
            const stringValue = value === null || value === undefined ? '' : String(value).replace(/"/g, '""');
            // Wrap in quotes if it contains commas or newlines
            return stringValue.includes(',') || stringValue.includes('\n') ? `"${stringValue}"` : stringValue;
        });
        csvRows.push(values.join(','));
    }

    // 3. Create CSV string and trigger download
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        // Fallback for older browsers
        window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
    }
}