export const combineData = (resourceDetailData, managerDetailData) => {
  if (!resourceDetailData || !managerDetailData) {
    console.error('One of the data sets is missing or undefined.');
    return [];
  }

  console.log('Combining Resource and Manager Data using Employee ID...');

  // Initialize an array to store the combined data
  const combinedArray = resourceDetailData.map((resource) => {
    // Safely get the Employee ID from the resource data and ensure it's a string
    const resourceEmployeeId = resource['Employee ID']?.toString().trim();

    if (!resourceEmployeeId) {
      console.warn('Resource entry is missing a valid Employee ID:', resource);
      return resource; // If no Employee ID is found, return the resource data as-is
    }

    // Find matching manager data by Employee ID
    const matchingManager = managerDetailData.find((manager) => {
      const managerEmployeeId = manager['Employee ID']?.toString().trim();
      return managerEmployeeId === resourceEmployeeId;
    });

    // Combine resource and manager data when a match is found
    if (matchingManager) {
      // Create a combined object with all unique columns from both data sets
      const combined = { ...resource };

      // Add manager data columns that are not present in the resource data
      Object.keys(matchingManager).forEach((key) => {
        if (!(key in combined)) {
          combined[key] = matchingManager[key];
        }
      });

      return combined;
    }

    // If no match is found, return just the resource data
    return resource;
  });

  console.log('Combined Data:', combinedArray);
  return combinedArray;
};
