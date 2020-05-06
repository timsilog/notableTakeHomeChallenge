require('dotenv').config();
const express = require('express');
const db = require('./mockDb.json');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log(db);

let mockId = 1; // temporary id's. A real db would provide unique id's

// GET a list of all doctors
app.get('/doctors', (req, res) => {
  const doctors = db.doctors;
  return res.send(doctors);
});

// GET a list of all appointments for a doctor and day
app.get('/appointments', (req, res) => {
  const doctor = db.doctors[req.query.doctorId];
  if (!doctor) {
    return res.send({
      "error": "No doctor found"
    });
  }
  const calendar = db.calendars[doctor.calendarId];
  const targetDate = new Date(req.query.date);
  const targetDay = `${targetDate.getMonth() + 1}/${targetDate.getDate()}/${targetDate.getFullYear()}`;
  const appointments = calendar[targetDay];
  return res.send(appointments);
});

// POST [add] a new appointment to a doctor's calendar
app.post('/addappt', (req, res) => {
  const doctor = db.doctors[req.body.doctorId];
  if (!doctor) {
    return res.send({
      error: "No doctor of that id"
    })
  }
  const calendar = db.calendars[doctor.calendarId];
  const targetDate = new Date(req.body.date);
  const targetDay = `${targetDate.getMonth() + 1}/${targetDate.getDate()}/${targetDate.getFullYear()}`
  const targetTime = `${targetDate.getHours()}:${targetDate.getMinutes()}`;
  const today = new Date();
  if (targetDate.getTime() < today.getTime()) {
    return res.send({
      "error": "Date cannot be in the past"
    })
  }
  if (targetDate.getMinutes() % 15) {
    return res.send({
      "error": "Time must be in a 15 minute interval"
    });
  }
  const todaysAppts = calendar[targetDay];
  if (todaysAppts && todaysAppts[targetTime] && todaysAppts[targetTime].length >= 3) {
    return res.send({
      "error": "This time slot is full"
    });
  }
  if (!todaysAppts) {
    db.calendars[doctor.calendarId][targetDay] = {};
  }
  if (!db.calendars[doctor.calendarId][targetDay][targetTime]) {
    db.calendars[doctor.calendarId][targetDay][targetTime] = [];
  }

  db.calendars[doctor.calendarId][targetDay][targetTime].push({
    id: mockId,
    kind: req.body.kind
  })
  mockId++;
  fs.writeFileSync('./mockDb.json', JSON.stringify(db));
  return res.send('Success')
});

// DELETE an existing appointment from a doctor's calendar
app.delete('/delappt', (req, res) => {
  const doctor = db.doctors[req.body.doctorId];
  if (!doctor) {
    return res.send({
      error: "No doctor of that id"
    })
  }
  const targetDate = new Date(req.body.date);
  const targetDay = `${targetDate.getMonth() + 1}/${targetDate.getDate()}/${targetDate.getFullYear()}`
  const targetTime = `${targetDate.getHours()}:${targetDate.getMinutes()}`;
  try {
    const appointments = db.calendars[doctor.calendarId][targetDay][targetTime];
    for (let i = 0; i < appointments.length; i++) {
      const appt = appointments[i];
      if (appt.id == req.body.apptId) {
        appointments.splice(i, 1);
        db.calendars[doctor.calendarId][targetDay][targetTime] = appointments;
        fs.writeFileSync('./mockDb.json', JSON.stringify(db));
        return res.send("success")
      }
    }
  } catch (err) {
    console.error(err);
    return res.send({
      error: "No appointments found at that date"
    })
  }

});

app.listen(process.env.PORT, () => {
  console.log('listening on port 3000')
})