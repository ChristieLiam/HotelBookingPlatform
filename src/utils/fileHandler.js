const fs = require("fs"); // Importing the 'fs' module for file system operations

// Defining file locations for room and booking data
let fileLocations = {
    bookings: "../data/bookings.json", // Path to the bookings JSON file
    rooms: "../data/rooms.json" // Path to the rooms JSON file
};

/**
 * Function to load room data based on room type
 * @param {string} roomType - The type of room to retrieve
 * @returns {Array|null} - Returns an array of rooms matching the specified type or null if an error occurs
 */
function loadRoomsData(roomType) {
    try {
        // Read the rooms JSON file
        let rawData = fs.readFileSync(fileLocations.rooms, "utf8");

        // Parse the raw JSON data into an object
        let roomData = JSON.parse(rawData);

        // Filter rooms by the specified type (case-insensitive)
        let filteredRooms = roomData.filter(item => item.type.toLowerCase() === roomType.toLowerCase());

        // Extract and return the list of rooms for the filtered room types
        let requestedData = filteredRooms.flatMap(item => item.rooms || []);

        return requestedData;
    } catch (error) {
        // Log any errors and return null
        console.log("Error loading rooms data:", error);
        return null;
    }
}

/**
 * Function to get all available room types in the hotel
 * @returns {Array|null} - Returns an array of room types or null if an error occurs
 */
function getRoomTypes() {
    try {
        // Read and parse the rooms JSON file
        let rawData = fs.readFileSync(fileLocations.rooms, "utf8");
        let roomData = JSON.parse(rawData);

        // Extract room types
        let filteredTypes = roomData.map(item => item.type);

        return filteredTypes;
    } catch (error) {
        // Log any errors and return null
        console.log("Error loading rooms data:", error);
        return null;
    }
}

/**
 * Function for loading all booking data
 * @returns {Object|null} - Returns the bookings data or null if an error occurs
 */
function loadBookingsData() {
    try {
        // Read and parse the bookings JSON file
        let rawData = fs.readFileSync(fileLocations.bookings, "utf8");
        let bookingData = JSON.parse(rawData);

        return bookingData;
    } catch (error) {
        // Log any errors and return null
        console.log("Error loading bookings data:", error);
        return null;
    }
}

/**
 * Function to upload a new booking to the bookings file
 * @param {Object} newBooking - The booking details to be added
 * @param {number} roomNumber - The room number for the new booking
 */
function uploadNewBookingsData(newBooking, roomNumber) {

    /**
     * Helper function to check if a room exists in the current bookings
     * @param {Object} data - The current bookings data
     * @returns {boolean} - Returns true if the room exists, false otherwise
     */
    function verifyRoomExistsInBooking(data) {
        for (let room of data.rooms) {
            if (room.room_number === roomNumber) {
                return true; // Room found in bookings
            }
        }
        return false; // Room not found
    }

    try {
        // Read and parse the bookings JSON file
        let rawBookingData = fs.readFileSync(fileLocations.bookings, "utf8");
        let bookingData = JSON.parse(rawBookingData);

        // Check if the room already exists in the bookings
        if (verifyRoomExistsInBooking(bookingData)) {
            // console.log("Room exists, adding new booking");

            // Find the room and update its bookings
            bookingData.rooms.forEach(room => {
                if (room.room_number === roomNumber) {
                    room.bookings.push(newBooking); // Add the new booking

                    // Write the updated booking data back to the file
                    fs.writeFileSync(fileLocations.bookings, JSON.stringify(bookingData, null, 2));
                }
            });
        } else {
            // console.log("Room not found, adding new entry.");

            // Create a new room entry with the booking
            let roomAddition = {
                room_number: roomNumber,
                bookings: [ newBooking ]
            };

            bookingData.rooms.push(roomAddition);

            // Write the updated booking data back to the file
            fs.writeFileSync(fileLocations.bookings, JSON.stringify(bookingData, null, 2));
        }
    } catch (error) {
        console.log("Error uploading booking data:", error);
        return null;
    }
}

// Export the functions for use in other modules
module.exports = { loadRoomsData, loadBookingsData, getRoomTypes, uploadNewBookingsData };
