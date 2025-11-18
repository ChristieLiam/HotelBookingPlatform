const fileHandler = require('../utils/fileHandler.js');

/**
 * Validates the room selection, ensuring that the entered room type exists.
 *
 * @param {string} selection - The room type entered by the user.
 * @returns {boolean} - Returns true if the room type exists, otherwise false.
 */
function validateRoomSelection(selection) {
    let roomTypes = fileHandler.getRoomTypes();

    for (let type of roomTypes) {
        if (selection.toLowerCase().includes(type.toLowerCase())) {
            return true;
        }
    }

    return false; // If the room type doesn't exist, return false.
}

/**
 * Validates that the check-in date is before the check-out date.
 * Ensures that users cannot book a room with an illogical date range.
 *
 * @param {string} checkIn - Check-in date as a string.
 * @param {string} checkOut - Check-out date as a string.
 * @returns {boolean} - Returns true if dates are valid, otherwise false.
 */
function validateDates(checkIn, checkOut) {
    if (checkIn != null && checkOut != null) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        return checkOutDate > checkInDate; // Ensures check-out is after check-in.
    }

    return false; // If dates are null, return false.
}

/**
 * Checks if a room is available for the selected date range.
 *
 * @param {string} roomType - The type of room being requested.
 * @param {number|null} roomNum - The specific room number (if specified by the user).
 * @param {string} selectedCheckInDate - The check-in date.
 * @param {string} selectedCheckOutDate - The check-out date.
 * @returns {{available: boolean, roomNumber: number|null}} - Availability status and available room number (if any).
 */
function validateRoomsAvailable(roomType, roomNum, selectedCheckInDate, selectedCheckOutDate) {
    let roomData = fileHandler.loadRoomsData(roomType);
    let bookingData = fileHandler.loadBookingsData();
    const checkInDate = new Date(selectedCheckInDate);
    const checkOutDate = new Date(selectedCheckOutDate);

    /**
     * Checks if a specific room is available.
     * @param {number} roomNumber - The room number to check.
     * @returns {{available: boolean, roomNumber: number|null}} - Availability status and room number.
     */
    function isRoomAvailable(roomNumber) {
        let bookedRoom = bookingData.rooms.find(r => r.room_number === roomNumber);

        if (!bookedRoom || !bookedRoom.bookings || bookedRoom.bookings.length === 0) {
            return { available: true, roomNumber };
        }

        for (let booking of bookedRoom.bookings) {
            const bookingCheckInDate = new Date(booking.checkIn);
            const bookingCheckOutDate = new Date(booking.checkOut);

            // Check for overlapping stay
            if (
                (checkInDate >= bookingCheckInDate && checkInDate < bookingCheckOutDate) ||
                (checkOutDate > bookingCheckInDate && checkOutDate <= bookingCheckOutDate) ||
                (checkInDate <= bookingCheckInDate && checkOutDate >= bookingCheckOutDate)
            ) {
                return { available: false, roomNumber: null };
            }
        }

        return { available: true, roomNumber };
    }

    if (roomNum != null) {
        return isRoomAvailable(roomNum);
    } else {
        // Iterate over all rooms of the specified type and find an available one.
        for (let key in roomData) {
            let theRoom = roomData[key];
            let result = isRoomAvailable(theRoom.room_number);
            if (result.available) {
                return result;
            }
        }

        return { available: false, roomNumber: null }; // No available rooms found.
    }
}

/**
 * Validates if the specified room number exists within the given room type.
 *
 * @param {number} roomNum - The room number to validate.
 * @param {string} roomType - The type of room.
 * @returns {boolean} - Returns true if the room exists, otherwise false.
 */
function validateRoomNumber(roomNum, roomType) {
    let roomData = fileHandler.loadRoomsData(roomType);

    for (let key in roomData) {
        let theRoom = roomData[key];
        if (theRoom.room_number === roomNum) {
            return true;
        }
    }

    return false; // Room not found.
}

// Export the functions for use in other parts of the application.
module.exports = { validateRoomSelection, validateDates, validateRoomsAvailable, validateRoomNumber };
