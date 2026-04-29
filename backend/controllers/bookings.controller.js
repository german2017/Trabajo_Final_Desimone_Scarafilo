const { readData, writeData } = require('../utils/fileDb');

const BOOKINGS_FILE = 'bookings.json';

async function getBookings(req, res, next) {
  try {
    const bookings = await readData(BOOKINGS_FILE);
    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
}

async function getBookingsByUser(req, res, next) {
  try {
    const { userId } = req.params;
    const bookings = await readData(BOOKINGS_FILE);
    const filtered = bookings.filter((booking) => booking.tenantId === userId || booking.ownerId === userId);
    res.json({ success: true, bookings: filtered });
  } catch (error) {
    next(error);
  }
}

async function createBooking(req, res, next) {
  try {
    const booking = req.body;
    const bookings = await readData(BOOKINGS_FILE);
    const newBooking = {
      id: String(Date.now()),
      status: 'Pendiente',
      ...booking
    };

    bookings.push(newBooking);
    await writeData(BOOKINGS_FILE, bookings);
    res.status(201).json({ success: true, booking: newBooking });
  } catch (error) {
    next(error);
  }
}

async function updateBookingStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const bookings = await readData(BOOKINGS_FILE);
    const booking = bookings.find((item) => item.id === id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
    }

    booking.status = status;
    await writeData(BOOKINGS_FILE, bookings);
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBookings,
  getBookingsByUser,
  createBooking,
  updateBookingStatus
};
