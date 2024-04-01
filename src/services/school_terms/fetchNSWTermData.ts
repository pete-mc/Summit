// Define the type for the data in the CSV file
type SchoolDayData = {
  START_DAY: string;
  END_DAY: string;
};

// Define the array to store the loaded data
const schoolDayDataArray: SchoolDayData[] = [];

// Define the function to load the CSV file from the URL and group it by year and terms
export default async function fetchNSWTermData() {
  try {
    const response = await fetch("https://opendata.transport.nsw.gov.au/dataset/963e4946-46c0-4c9c-b4dc-5033c9e61f5c/resource/66953545-0a91-4a85-92c3-edf46b0f67e3/download/school_day-2019-2025.csv", {
      method: "GET",
      mode: "no-cors",
      cache: "no-cache",
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const decoder = new TextDecoder("utf8");
    const csv = decoder.decode(data);
    const rows = csv.split("\n");
    const headers = rows[0].split(",");
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(",");
      const schoolDayData: SchoolDayData = {
        START_DAY: values[headers.indexOf("START_DAY")],
        END_DAY: values[headers.indexOf("END_DAY")],
      };
      schoolDayDataArray.push(schoolDayData);
    }
    // Group the data by year and terms
    const groupedData: { [key: string]: { [key: string]: SchoolDayData[] } } = {};
    for (const data of schoolDayDataArray) {
      const startDate = new Date(data.START_DAY);
      const year = startDate.getFullYear();
      const month = startDate.getMonth() + 1;
      const term = Math.ceil(month / 3);
      if (!groupedData[year]) {
        groupedData[year] = {};
      }
      if (!groupedData[year][term.toString()]) {
        groupedData[year][term.toString()] = [];
      }
      groupedData[year][term.toString()].push(data);
    }
    return groupedData;
  } catch (error) {
    console.error("Error loading school day data:", error);
  }
}
