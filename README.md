# notableTakeHomeChallenge
Submission for Notable Takehome Challenge

A json file is used as a mock database, thus structure of the db is not optimal, so the nature of searches/insertions/deletions may be wonky. I'm aware you guys are using PostGres. 

Run with:
`node app.js`

Sample requests are provided in `route.rest`

Doctors are structured as:
```
id: {
  firstName: string,
  lastName: string,
  calendarId: string
}
```

Calendars as:
```
id: {
  [date: string]: {
    [time: string]: {
      id: string,
      kind: string
    }
  }
}
```