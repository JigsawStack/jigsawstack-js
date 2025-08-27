/**
 * Creates FormData for file uploads with optional parameters
 * @param file - The file to upload (Blob or Buffer)
 * @param options - Optional parameters to include in the form data
 * @param fileFieldName - The field name for the file (defaults to "file")
 * @returns FormData object ready for upload
 */
export function createFileUploadFormData(file: Blob | Buffer, options?: Record<string, any>, fileFieldName: string = "file"): FormData {
  const formData = new FormData();

  // Convert Buffer to Blob if needed
  const fileToAppend = file instanceof Buffer ? new Blob([file]) : file;
  formData.append(fileFieldName, fileToAppend);

  // Add options as form fields, handling arrays and objects properly
  if (options) {
    for (const [key, value] of Object.entries(options)) {
      if (value === undefined || value === null) {
        continue; // Skip undefined/null values
      }

      if (Array.isArray(value)) {
        // Convert arrays to JSON strings
        formData.append(key, JSON.stringify(value));
      } else if (typeof value === "object") {
        // Convert objects to JSON strings
        formData.append(key, JSON.stringify(value));
      } else {
        // Convert primitives to strings
        formData.append(key, String(value));
      }
    }
  }

  return formData;
}
