import Papa from 'papaparse';

/**
 * A generic function to export an array of objects to a CSV file.
 * @param data The array of data to be exported.
 * @param filename The desired name of the output file, without the extension.
 */
export const exportToCsv = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error("No data provided to export.");
    alert("Não há dados para exportar.");
    return;
  }
  
  // Convert data to CSV format
  const csv = Papa.unparse(data);
  
  // Create a Blob from the CSV string
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  
  // Create a link and trigger the download
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
