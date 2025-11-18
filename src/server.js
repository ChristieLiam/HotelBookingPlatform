// Import necessary modules
const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');
const path = require('path');

// Define file paths
let filenames = {
    html: "/index.html",
    css: "/styles.css",
    fileHandler: "/fileHandler.js",
    validator: "/validator.js",
    bookings: "/templates/booking.html",
    roomData: "/templates/roomData.html",
    bookingSearch: "/templates/bookingSearch.html",
    bookingConfirmation: "/templates/bookingConfirmation.html",
};

// Set the parent directory and load utility modules
const parentDirectory = path.dirname(__dirname);
const validator = require(`${"./utils" + filenames.validator}`);
const fileHandler = require(`${"./utils" + filenames.fileHandler}`);

// Read HTML and CSS files
const htmlFile = fs.readFileSync(`${parentDirectory}${"/public" + filenames.html}`, 'utf-8');
const cssFile = fs.readFileSync(`${parentDirectory}${"/public" + filenames.css}`);
const bookingHTML = fs.readFileSync(`${parentDirectory}${filenames.bookings}`, 'utf-8');
const roomDataHTML = fs.readFileSync(`${parentDirectory}${filenames.roomData}`, 'utf8');
const bookingSearch = fs.readFileSync(`${parentDirectory}${filenames.bookingSearch}`, 'utf8');
const bookingConfirmation = fs.readFileSync(`${parentDirectory}${filenames.bookingConfirmation}`, 'utf8');

// Initialize searchParam variable
let searchParam;

// Create HTTP server to handle requests
const server = http.createServer((req, res) => {

    const {pathname, query} = url.parse(req.url); // Parse URL for path and query
    const queryParams = querystring.parse(query); // Parse query string

    // Update searchParam if a search query exists
    if (queryParams.search === undefined) {

    } else {
        searchParam = queryParams.search;
    }

    // console.log("Search Value:"+searchParam);

    switch (pathname) {
        case `/`:
        case `/index.html`:
        case `${filenames.html}`:
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'}); // Respond with HTML
            res.end(htmlFile);
            break;
        case `${filenames.css}`:
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/css'); // Respond with CSS
            res.end(cssFile);
            break;
        case `/api/rooms`:
            let roomData;
            if (searchParam !== undefined && searchParam !== null) {
                if (validator.validateRoomSelection(searchParam)) { // Validate room search
                    let rooms = fileHandler.loadRoomsData(searchParam); // Load rooms data
                    roomData = JSON.stringify(rooms);
                    res.writeHead(200, {'Content-Type': 'application/json'}); // Respond with room data
                    res.end(roomData);
                } else {
                    roomData = JSON.stringify({error: true});
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(roomData);
                }
            }
            break;
        case pathname.includes("/room/") ? pathname : null: {
            let thePath = pathname.split("/room/")[1]; // Extract Room ID
            let roomType = decodeURIComponent(thePath); // Decode URL-encoded room type

            let rooms = fileHandler.loadRoomsData(roomType); // Load rooms data
            let roomData = rooms.find(room => room.room_type === roomType); // Find the correct room

            let updatedRoomDataHTML;

            if (!roomDataHTML) {
                console.error("roomDataHTML is undefined or null");
                res.statusCode = 404;
                res.end("<h1>Server Error: Missing Room Webpage</h1>");
                return;
            } else {

                updatedRoomDataHTML = roomDataHTML.replace('%_ROOM_NAME_%', roomData.name);
                updatedRoomDataHTML = updatedRoomDataHTML.replace('%_ROOM_TYPE_%', roomData.room_type);
                updatedRoomDataHTML = updatedRoomDataHTML.replace('%_ROOM_PRICE_%', roomData.price + "CAD");

                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end(updatedRoomDataHTML);
            }

            return; // Stop further execution after response is sent
        }
        case '/booking/submission/':

            let updatedBookingHTML;

            let fullName = queryParams.name;
            let email = queryParams.email;
            let phoneNumber = queryParams.phone;
            let selectedCheckInDate = queryParams.checkInDate;
            let selectedCheckOutDate = queryParams.checkOutDate;
            let selectedRoomType = queryParams.roomType;
            let wishedRoomNumber = queryParams.roomNum;

            let verifiedRoomNumber;

            if (wishedRoomNumber != null && wishedRoomNumber !== "" && wishedRoomNumber !== undefined) {
                if (validator.validateRoomNumber(wishedRoomNumber, selectedRoomType)) {
                    verifiedRoomNumber = wishedRoomNumber;
                } else {
                    updatedBookingHTML = bookingHTML.replace('<!--ALERT_MESSAGE_HERE-->', `
                        <div class="d-flex justify-content-center align-items-center flex-column gap-2 alert alert-warning" role="alert">
                        Invalid room number. Please enter a valid room number for your room type.</div>`);

                    // Return immediately with the error message and stop further execution
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'text/html');
                    res.end(updatedBookingHTML);
                    return;  // Exit here, preventing the form from being processed further
                }
            }

            if (validator.validateDates(selectedCheckInDate, selectedCheckOutDate)) {

                let data = validator.validateRoomsAvailable(selectedRoomType, verifiedRoomNumber, selectedCheckInDate, selectedCheckOutDate)

                let roomAvailable = data.available;  // true or false
                let roomNumber = data.roomNumber; // The assigned room number or null


                if (roomAvailable) {

                    let booking = {
                        name: fullName,
                        phone: phoneNumber,
                        email: email,
                        checkIn: selectedCheckInDate,
                        checkOut: selectedCheckOutDate
                    };

                    fileHandler.uploadNewBookingsData(booking, roomNumber);

                    updatedBookingHTML = bookingSearch;

                    res.writeHead(302, {Location: '/findBooking'});
                    res.end();

                    return;

                } else {

                    if (verifiedRoomNumber != null) {
                        updatedBookingHTML = bookingHTML.replace('<!--ALERT_MESSAGE_HERE-->', `
                        <div class="d-flex justify-content-center align-items-center flex-column gap-2 alert alert-warning" role="alert">
                        Room Specified Isn't Available Within Dates - Consider checking for other rooms.</div>`);
                    } else {
                        updatedBookingHTML = bookingHTML.replace('<!--ALERT_MESSAGE_HERE-->', `
                        <div class="d-flex justify-content-center align-items-center flex-column gap-2 alert alert-warning" role="alert">There Is No Room Available Within Dates</div>`);
                    }

                }

            } else {
                updatedBookingHTML = bookingHTML.replace('<!--ALERT_MESSAGE_HERE-->', `
                <div class="d-flex justify-content-center align-items-center flex-column gap-2 alert alert-warning" role="alert">Dates Are Not Valid</div>`);
            }


            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/html');
            res.end(updatedBookingHTML);
            break;
        case `/booking`:
            res.setHeader('Content-Type', 'text/html');
            res.end(bookingHTML);
            break;
        case `/findBooking`:
            let updatedHTML;

            if (queryParams && queryParams.name && queryParams.checkIn) {
                // Extract and sanitize inputs (name and check-in date)
                let givenName = queryParams.name;
                let givenCheckIn = new Date(queryParams.checkIn);

                // Validate the check-in date and name input
                if (!isNaN(givenCheckIn.getTime()) && givenName !== "") {
                    let bookingData = fileHandler.loadBookingsData();
                    let foundRoom = null;
                    let foundBooking = null;

                    // Optimized search: Loop through rooms and their bookings to find the matching booking
                    for (let room of bookingData.rooms) {
                        for (let booking of room.bookings) {
                            let bookingCheckIn = new Date(booking.checkIn);

                            // Compare the name and check-in date to find the correct booking
                            if (
                                booking.name.toLowerCase().includes(givenName.toLowerCase()) &&
                                bookingCheckIn.toISOString().split('T')[0] === givenCheckIn.toISOString().split('T')[0]
                            ) {
                                foundRoom = room;
                                foundBooking = booking;
                            }
                        }
                    }

                    // If the booking is found, update the HTML with the booking details
                    if (foundBooking) {
                        updatedHTML = bookingSearch.replace('<div id="dataHere"></div>', bookingConfirmation)
                            .replace('%_ROOM_NUM_%', foundRoom.room_number)
                            .replace('%_NAME_%', foundBooking.name)
                            .replace('%_PHONE_NUM_%', foundBooking.phone)
                            .replace('%_EMAIL_%', foundBooking.email)
                            .replace('%_CHECK_IN_%', foundBooking.checkIn)
                            .replace('%_CHECK_OUT_%', foundBooking.checkOut);
                    } else {
                        // If booking not found, show an alert message
                        updatedHTML = bookingSearch.replace('<!--ALERT_MESSAGE_HERE-->', `<div class="alert alert-warning" role="alert">Couldn't Find Booking</div>`);
                    }
                } else {
                    // If the input is invalid, show an error message
                    updatedHTML = bookingSearch.replace('<!--ALERT_MESSAGE_HERE-->', `<div class="alert alert-warning" role="alert">Invalid input provided</div>`);
                }
            } else {
                // If no parameters are provided, just show the default search page
                updatedHTML = bookingSearch;
            }

            // Set the content type to HTML and send the updated page as a response
            res.setHeader('Content-Type', 'text/html');
            res.end(updatedHTML);
            break;
        default:
            res.statusCode = 404; // Handle invalid routes
            res.setHeader('Content-Type', 'text/html');
            res.end('<h1>Oops! Not found!</h1>');
            break;
    }

});

// Define the server port and host
const port = 5000;
const host = 'localhost';
server.listen(port, host, () => {
    console.log(`listening at http://${host}:${port}`);
});
