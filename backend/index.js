import express from 'express';
import mysql from "mysql";
import cors from "cors";

const app = express();

const db = mysql.createConnection({
host:"medical-clinic-database.mysql.database.azure.com", 
user:"group8", 
password:"Abcd1234", 
database:"medical_clinic_database", 
port:3306, 
});

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.json("Hello this is mr.backend! 乁( ⁰͡ Ĺ̯ ⁰͡ ) ㄏ");
});

// Login route
app.post("/login", (req, res) => {
    const { ID, password } = req.body;
    const q1 = "SELECT * FROM employee WHERE employee_ID = ?";
    const q2 = "SELECT * FROM patient WHERE Medical_ID = ?";
    const q3 = "SELECT * FROM employee_password WHERE employee_ID = ?";
    const q4 = "SELECT * FROM patient_password WHERE medical_ID = ?";

    if (!ID || !password) {
        return res.status(400).json({ message: "ID and password are required." });
    }

    const firstLetter = ID.charAt(0); // Get the first letter
    if (firstLetter === 'E') {
        db.query(q1, [ID], (err, data) => {
            if (err) {
                console.error(err);
                return res.json(err);
            }
            if (data.length > 0) {
                db.query(q3, [ID], (err, passData) => {
                    if (err) {
                        console.error(err);
                        return res.json(err);
                    }
                    if (passData.length > 0) {
                        if (passData[0].password === password) {
                            return res.json(data[0]); // Return employee data
                        } else {
                            return res.json("Password incorrect");
                        }
                    } else {
                        return res.json("Password record not found");
                    }
                });
            } else {
                return res.json("Employee not found");
            }
        });
    } else if (firstLetter === 'M') {
        db.query(q2, [ID], (err, data) => {
            if (err) {
                console.error(err);
                return res.json(err);
            }
            if (data.length > 0) {
                db.query(q4, [ID], (err, passData) => {
                    if (err) {
                        console.error(err);
                        return res.json(err);
                    }
                    if (passData.length > 0) {
                        if (passData[0].password === password) {
                            return res.json(data[0]); // Return patient data
                        } else {
                            return res.json("Password incorrect" );
                        }
                    } else {
                        return res.json("Password not found" );
                    }
                });
            } else {
                return res.json("Patient not found" );
            }
        });
    } else {
        return res.json("ID must start with 'E' or 'M'");
    }
});

// Get doctors
app.get("/doctors", (req, res) => {
    const q = "SELECT * FROM doctors";
    db.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.json(data);
    });
});

// Create doctor
app.post("/doctors", (req, res) => {
    console.log(req.body);
    
    const q1 = "INSERT INTO employee (employee_ID, first_name, last_name, role) VALUES (?, ?, ?, 'Doctor')";
    const employeeValues = [
        req.body.employee_ID,
        req.body.first_name,
        req.body.last_name
    ];

    const q2 = "INSERT INTO doctors (employee_ID, specialty, first_name, last_name, phone_number, work_address, created, last_edited) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const doctorValues = [
        req.body.employee_ID,
        req.body.specialty,
        req.body.first_name,
        req.body.last_name,
        req.body.phone_number,
        req.body.work_address,
        req.body.created,
        req.body.created
    ];

    db.query(q1, employeeValues, (err) => {
        if (err) {
            return res.status(500).json({ error: "Error inserting into employee table", details: err });
        }

        db.query(q2, doctorValues, (err) => {
            if (err) {
                return res.status(500).json({ error: "Error inserting into doctors table", details: err });
            }
            return res.json("A doctor has been created successfully!");
        });
    });
});

// Update doctor
app.put("/doctors/:employee_ID", (req, res) => {
    const employee_id = req.params.employee_ID;
    const q1 = "UPDATE doctors SET specialty = ?, first_name = ?, last_name = ?, phone_number = ?, work_address = ? WHERE employee_ID = ?";
    const q2 = "UPDATE employee SET first_name = ?, last_name = ? WHERE employee_ID = ?";
    
    const values = [
        req.body.specialty,
        req.body.first_name,
        req.body.last_name,
        req.body.phone_number,
        req.body.work_address,
        employee_id
    ];

    db.query(q1, values, (err) => {
        if (err) return res.status(500).json(err);

        const employeeValues = [
            req.body.first_name,
            req.body.last_name,
            employee_id
        ];

        db.query(q2, employeeValues, (err) => {
            if (err) return res.status(500).json(err);
            return res.json("Doctor and employee have been updated!");
        });
    });
});

// Delete doctor
app.delete("/doctors/:employee_ID", (req, res) => {
    const employee_id = req.params.employee_ID;
    const q1 = "DELETE FROM doctors WHERE employee_ID = ?";
    const q2 = "DELETE FROM employee WHERE employee_ID = ?";

    db.query(q1, [employee_id], (err) => {
        if (err) return res.status(500).json(err);

        db.query(q2, [employee_id], (err) => {
            if (err) return res.status(500).json(err);
            return res.json("Doctor and employee have been deleted!");
        });
    });
});

// Create Office Staff
app.post("/staff/officestaff", (req, res) => {
    const { employee_ID, first_name, last_name, phone_number, email, address, manager, created, creatorID } = req.body;

    const defaultAvailability = 'all day'; // Default availability

    const q1 = "INSERT INTO employee (employee_ID, first_name, last_name, role) VALUES (?, ?, ?, 'OfficeStaff')";
    const employeeValues = [employee_ID, first_name, last_name];

    const q2 = "INSERT INTO officestaff (employee_ID, first_name, last_name, phone_number, email, address, manager, availabilityMon, availabilityTues, availabilityWed, availabilityThurs, availabilityFri, created, creatorID, last_edited) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const staffValues = [
        employee_ID,
        first_name,
        last_name,
        phone_number,
        email,
        address,
        manager,
        defaultAvailability, // Set availability to 'all day'
        defaultAvailability,
        defaultAvailability,
        defaultAvailability,
        defaultAvailability,
        created,
        creatorID,
        created
    ];

    db.query(q1, employeeValues, (err) => {
        if (err) {
            return res.status(500).json({ error: "Error inserting into employee table", details: err });
        }

        db.query(q2, staffValues, (err) => {
            if (err) {
                return res.status(500).json({ error: "Error inserting into officestaff table", details: err });
            }
            return res.json("An Office Staff member has been created successfully!");
        });
    });
});

// Create Billing Staff
app.post("/staff/billingstaff", (req, res) => {
    const { employee_ID, first_name, last_name, phone_number, email, work_address, created, creatorID } = req.body;

    const defaultAvailability = 'all day'; // Default availability

    const q1 = "INSERT INTO employee (employee_ID, first_name, last_name, role) VALUES (?, ?, ?, 'BillingStaff')";
    const employeeValues = [employee_ID, first_name, last_name];

    const q2 = "INSERT INTO billingstaff (employee_ID, first_name, last_name, phone_number, email, address, availabilityMon, availabilityTues, availabilityWed, availabilityThurs, availabilityFri, created, creatorID, last_edited) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const staffValues = [
        employee_ID,
        first_name,
        last_name,
        phone_number,
        email,
        address,
        defaultAvailability, // Set availability to 'all day'
        defaultAvailability,
        defaultAvailability,
        defaultAvailability,
        defaultAvailability,
        created,
        creatorID,
        created
    ];

    db.query(q1, employeeValues, (err) => {
        if (err) {
            return res.status(500).json({ error: "Error inserting into employee table", details: err });
        }

        db.query(q2, staffValues, (err) => {
            if (err) {
                return res.status(500).json({ error: "Error inserting into billingstaff table", details: err });
            }
            return res.json("A Billing Staff member has been created successfully!");
        });
    });
});


// Update Office Staff
app.put("/staff/officestaff/:employee_ID", (req, res) => {
    const employee_ID = req.params.employee_ID;
    const { first_name, last_name, phone_number, address } = req.body;

    const query = "UPDATE officestaff SET first_name = ?, last_name = ?, phone_number = ?, address = ? WHERE employee_ID = ?";
    const values = [first_name, last_name, phone_number, address, employee_ID];

    db.query(query, values, (err) => {
        if (err) return res.status(500).json(err);
        return res.json("Office staff updated successfully!");
    });
});

// Update Billing Staff
app.put("/staff/billingstaff/:employee_ID", (req, res) => {
    const employee_ID = req.params.employee_ID;
    const { first_name, last_name, phone_number, address } = req.body;

    const query = "UPDATE billingstaff SET first_name = ?, last_name = ?, phone_number = ?, address = ? WHERE employee_ID = ?";
    const values = [first_name, last_name, phone_number, address, employee_ID];

    db.query(query, values, (err) => {
        if (err) return res.status(500).json(err);
        return res.json("Billing staff updated successfully!");
    });
});


// Director view
app.get("/director_view/:employee_ID", (req, res) => {
    const director_id = req.params.employee_ID;

    const q_doctors = `
        SELECT d.employee_ID, d.first_name, d.last_name, d.specialty, esl.working_time, o.name AS office_name, o.location_ID 
        FROM doctors d 
        JOIN employee_schedule_location esl ON d.employee_ID = esl.schedule_ID 
        JOIN office o ON esl.mon_avail = o.location_ID OR esl.tues_avail = o.location_ID OR esl.wed_avail = o.location_ID OR esl.thurs_avail = o.location_ID OR esl.fri_avail = o.location_ID 
        WHERE o.director_ID = ? 
        AND (esl.mon_avail IS NOT NULL OR esl.tues_avail IS NOT NULL OR esl.wed_avail IS NOT NULL OR esl.thurs_avail IS NOT NULL OR esl.fri_avail IS NOT NULL);
    `;

    db.query(q_doctors, [director_id], (err, doctors) => {
        if (err) return res.status(500).json(err);
        if (doctors.length === 0) return res.status(404).json("No doctors found.");
        
        return res.json(doctors); // Send back the doctors data
    });
});

// get Director Office ID
app.get("/director_office/:directorId", (req, res) => {
    const directorId = req.params.directorId;

    const query = "SELECT location_ID FROM office WHERE director_ID = ?";
    
    db.query(query, [directorId], (err, results) => {
        if (err) {
            console.error('Error fetching director office ID:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (results.length > 0) {
            return res.json({ officeId: results[0].location_ID });
        } else {
            return res.status(404).json({ message: 'Director not found or no office associated' });
        }
    });
});



// Get patients from doctors_patient table
app.get("/doctors_patient/:doctorId", (req, res) => {
    const doctorId = req.params.doctorId;

    const q = `
        SELECT p.first_name, p.last_name, p.medical_ID, p.home_phone, p.address_line_1, p.address_line_2, p.city, p.state, p.zip, p.personal_email
        FROM patient p
        JOIN doctors_patient dp ON p.medical_ID = dp.patient_ID
        WHERE dp.doctor_ID = ? 
    `;

    db.query(q, [doctorId], (err, patients) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).json(err);
        }
        if (patients.length === 0) {
            return res.status(404).json("No patients found for this doctor.");
        }
        
        return res.json(patients); // Send back the patients data
    });
});

//retrieve office staff and billing staff
app.get("/staff_management", (req, res) => {
    const q = `
        SELECT e.employee_ID, e.first_name, e.last_name, e.role
        FROM employee e
        WHERE e.role IN ('OfficeStaff', 'BillingStaff')
    `;

    db.query(q, (err, staff) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(staff); // Send back the staff data
    });
});

// Get appointments for a specific director's office
app.get("/appointments/:directorId", (req, res) => {
    const directorId = req.params.directorId;

    const q = `
    SELECT * 
FROM appointment 
WHERE officeID IN (SELECT location_ID FROM office WHERE director_ID = ?)
`;


    db.query(q, [directorId], (err, appointment) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }
        return res.json(appointment);
    });
});

// get appointment info by AppointmentID
app.get('/appointment/:id', (req, res) => {
    const appointmentId = req.params.id;
    db.query('SELECT * FROM appointment WHERE appointment_ID = ?', [appointmentId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Calculate profit for specific appointment IDs
app.get("/profit", (req, res) => {
    const { appointmentIds } = req.query; // Expecting a comma-separated list of appointment IDs

    if (!appointmentIds) {
        return res.status(400).json({ message: "appointmentIds query parameter is required." });
    }

    const query = `
        SELECT SUM(amountCharged) AS profit
        FROM medical_clinic_database.invoice
        WHERE appointment_ID IN (?)
        AND amountDue = 0;
    `;

    db.query(query, [appointmentIds.split(',')], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json(err);
        }

        const profit = results[0]?.profit || 0; // Default to 0 if no profit found
        return res.json({ profit });
    });
});

app.get('/total_profit', (req, res) => {
    const q = `SELECT SUM(amountCharged) AS profit FROM invoices WHERE amountDue = 0`;
    
    db.query(q, (err, results) => {
        if (err) return res.status(500).json(err);
        return res.json({ profit: results[0].profit || 0 }); // Return profit or 0 if no results
    });
});


// get patient info by medical ID, including medical history and family history
app.get('/patient/:id', (req, res) => {
    const medicalId = req.params.id;
    const query = `
        SELECT p.*, 
               mr.height, 
               mr.weight, 
               mr.sex, 
               mr.allergies AS medical_allergies, 
               mh.conditions AS medical_conditions, 
               mh.treatment, 
               mh.medication, 
               mh.diagnosis_date, 
               fh.relation, 
               fh.conditions AS family_conditions 
        FROM patient p
        LEFT JOIN medical_record mr ON p.medical_ID = mr.medical_ID
        LEFT JOIN medical_history mh ON p.medical_ID = mh.medical_ID
        LEFT JOIN family_history fh ON p.medical_ID = fh.medical_ID
        WHERE p.medical_ID = ?
    `;
    
    db.query(query, [medicalId], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});
app.get('/api/patient/:id', (req, res) => {
    const medicalId = req.params.id;
    console.log(medicalId)
  
    // Query to get the most recent upcoming appointment
    const upcomingAppointmentQuery = `
      SELECT a.appointment_ID,a.dateTime, a.reason, a.doctor, o.name, o.address
      FROM appointment as a
      LEFT JOIN office as o ON a.officeId = o.location_ID
      WHERE a.patientmedicalID = ? AND a.dateTime > NOW() and isCanceled = 0
      ORDER BY a.dateTime ASC
      LIMIT 1;
    `;
  
    // Query to get the most recent 3 test results
    const recentTestsQuery = `
      SELECT test_name, test_date, result
      FROM test_history
      WHERE medical_ID = ?
      ORDER BY test_date DESC
      LIMIT 3;
    `;

    const top3RecentReferrals = `
        SELECT r1.status, r1.date_reviewed, r1.reason, 
    doc_origin.first_name as origin_first_name, doc_origin.last_name as origin_last_name, 
    doc_receive.first_name as receive_first_name, doc_receive.last_name as receive_last_name
    FROM (
    SELECT patient_ID, originating_doctor_ID, receiving_doctor_ID, status, date_reviewed, reason
    FROM referral 
    WHERE patient_ID = ?
    ORDER BY date_reviewed DESC  
    LIMIT 3  
    ) AS r1
    LEFT JOIN doctors AS doc_origin 
    ON r1.originating_doctor_ID = doc_origin.employee_ID
    LEFT JOIN doctors AS doc_receive
    ON r1.receiving_doctor_ID = doc_receive.employee_ID;
    `

    

  
    db.query(upcomingAppointmentQuery, [medicalId], (err1, appointmentResult) => {
      if (err1) {
        return res.status(500).json({ error: 'Failed to fetch upcoming appointment', details: err1 });
      }
  
      db.query(recentTestsQuery, [medicalId], (err2, testResults) => {
        if (err2) {
          return res.status(500).json({ error: 'Failed to fetch recent test results', details: err2 });
        }

        db.query(top3RecentReferrals, [medicalId], (err3, referralResults) => {
            if (err3) {
              return res.status(500).json({ error: 'Failed to fetch recent referrals', details: err3 });
            }
  
        // Handling upcoming appointment and recent test results
        const upcomingAppointment = appointmentResult.length > 0 ? appointmentResult[0] : null;
        const recentTests = testResults.length > 0 ? testResults : null;  // Set to null if no test results
        const recentReferrals = referralResults.length > 0 ? referralResults : null;  // Set to null if no referrals
        // Send response
          res.json({
               upcomingAppointment: upcomingAppointment,
               recentTests: recentTests,
               recentReferrals: recentReferrals

              });
        });

      });
    });
  });

app.get('/patient/:id/my_account/personal_information', (req, res) => {
    const medicalId = req.params.id;
 
    const personInformationQuery = `
       SELECT p.first_name, p.last_name, p.age, p.birthdate, p.address_line_1, p.address_line_2,
              p.city, p.state, p.zip, p.personal_email, p.home_phone, p.work_phone, p.cell_phone
       FROM patient p 
       WHERE p.medical_ID = ?;
    `;
 
    db.query(personInformationQuery, [medicalId], (err, personalData) => {
       if (err) {
          return res.status(500).json({ error: 'Failed to retrieve personal information', details: err });
       }
 
       if (personalData.length === 0) {
          return res.status(404).json({ error: 'No personal information found for the given medical ID' });
       }
 
       // Format the birthdate to just YYYY-MM-DD
       const formattedBirthdate = new Date(personalData[0].birthdate).toLocaleDateString('en-CA');  // Returns YYYY-MM-DD
 
       res.json({
          first_name: personalData[0].first_name,
          last_name: personalData[0].last_name,
          age: personalData[0].age,
          birthdate: formattedBirthdate,  // Send the formatted birthdate
          address: {
             line_1: personalData[0].address_line_1,
             line_2: personalData[0].address_line_2,
             city: personalData[0].city,
             state: personalData[0].state,
             zip: personalData[0].zip
          },
          contact: {
             personal_email: personalData[0].personal_email,
             home_phone: personalData[0].home_phone,
             work_phone: personalData[0].work_phone,
             cell_phone: personalData[0].cell_phone
          }
       });
    });
 });

 app.put('/patient/:id/my_account/personal_information',(req,res)=>{
    const medicalId = req.params.id;
    // console.log('req.body',req.body);
    const {
        age,
        birthdate,
        address ,
        contact,
    } = req.body;
    const {line_1, line_2, city, state, zip} = address
    const  {personal_email, home_phone, work_phone, cell_phone} = contact
    
    const updatePersonInformationQuery = `
       UPDATE patient
       SET  age = ?, birthdate = ?,
           address_line_1 = ?, address_line_2 = ?, city = ?, state = ?, zip = ?,
           personal_email = ?, home_phone = ?, work_phone = ?, cell_phone = ?,last_edited = NOW()
       WHERE medical_ID = ?;
    `;
    db.query(updatePersonInformationQuery, [
       
        age,
        birthdate,
        line_1,
        line_2,
        city,
        state,
        zip,
        personal_email,
        home_phone,
        work_phone,
        cell_phone,
       
        medicalId
    ], (err, result) => {
        if (err) {
            console.log('database error', err)
            return res.status(500).json({ error: 'Failed to update personal information', details: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'No patient found with the given medical ID' });
        }

        res.json({ message: 'Personal information updated successfully.' });
    });



 })


 app.get('/patient/appointment/availability', (req, res) => {
    const { doctorID, officeID } = req.query;

    if (!doctorID || !officeID) {
        return res.status(400).json({ error: "Please provide both doctorID and officeID" });
    }

    // First query: Get fully booked dates
    const fullyBookedDatesQuery = `
        SELECT 
            DATE(dateTime) AS unavailable_date
        FROM 
            appointment
        WHERE 
            doctorID = ? and isCanceled  = 0
        GROUP BY 
            DATE(dateTime)
        HAVING 
            COUNT(*) >= 8
    `;

    // Second query: Get unavailable days based on the doctor's schedule
    const unavailableDaysQuery = `
        SELECT 
            schedule_ID,
            CASE WHEN mon_avail != ? THEN 'Monday' END AS Monday,
            CASE WHEN tues_avail != ? THEN 'Tuesday' END AS Tuesday,
            CASE WHEN wed_avail != ? THEN 'Wednesday' END AS Wednesday,
            CASE WHEN thurs_avail != ? THEN 'Thursday' END AS Thursday,
            CASE WHEN fri_avail != ? THEN 'Friday' END AS Friday
        FROM 
            employee_schedule_location
        WHERE 
            schedule_ID = ?
    `;

    // Execute both queries
    db.query(fullyBookedDatesQuery, [doctorID], (err, fullyBookedResults) => {
        if (err) {
            console.error('Error fetching fully booked dates:', err);
            return res.status(500).json({ error: 'Failed to retrieve fully booked dates' });
        }

        db.query(unavailableDaysQuery, [officeID, officeID, officeID, officeID, officeID, doctorID], (err, unavailableDaysResults) => {
            if (err) {
                console.error('Error fetching unavailable days:', err);
                return res.status(500).json({ error: 'Failed to retrieve unavailable days' });
            }

            // Process unavailable days results to filter out null values
            const unavailableDays = [];
            unavailableDaysResults.forEach(row => {
                if (row.Monday) unavailableDays.push(row.Monday);
                if (row.Tuesday) unavailableDays.push(row.Tuesday);
                if (row.Wednesday) unavailableDays.push(row.Wednesday);
                if (row.Thursday) unavailableDays.push(row.Thursday);
                if (row.Friday) unavailableDays.push(row.Friday);
            });

            // Combine results and send response
            res.json({
                fullyBookedDates: fullyBookedResults.map(row => row.unavailable_date),
                unavailableDays: unavailableDays
            });
        });
    });
});



 app.get('/patient/appointments/time_slots', (req, res) => {
    const { doctorID, date, facility } = req.query;
    console.log(doctorID)
    console.log(date)
    console.log(facility)

    if (!doctorID || !date || !facility) {
        return res.status(400).json({ error: "Please provide  doctorID , date and facility" });
    }
    console.log(typeof doctorID,typeof date)
    // SQL query to retrieve all unavailable  time slots 
    const query = `
    SELECT 
    DATE(dateTime) AS appointment_date,
    HOUR(dateTime) AS appointment_hour,
    DATE_FORMAT(dateTime, '%h:%i %p') AS time_slot
    FROM 
    appointment
    WHERE 
    doctorID =  ? and date(datetime) = ? and officeID = ?  and isCanceled = 0
    ORDER BY
    appointment_hour 
    `;

    db.query(query, [doctorID, date, facility], (err, results) => {
        if (err) {
            
            console.error('Error fetching time slots:', err);
            return res.status(500).json({ error: 'Failed to retrieve time slots' });
        }
        console.log(results)
        // Respond with the time slots
        res.json({ timeSlots: results.map(row => row.time_slot) });
    });
});


app.get('/patient/:id/appointments/upcoming_appointments', (req, res) => {
    const medicalId = req.params.id;
    console.log('asdfasdfasdfasdfasdfasdf')
    // Query to retrieve all upcoming appointments
    const upcomingAppointmentQuery = `
        SELECT a.appointment_ID, a.dateTime, a.reason, a.doctor, o.name, o.address
        FROM appointment as a 
        LEFT JOIN office as o ON a.officeId = o.location_ID
        WHERE a.patientmedicalID = ? AND a.dateTime > NOW() AND isCanceled = 0
        ORDER BY a.dateTime;
    `;

    // Execute the query
    db.query(upcomingAppointmentQuery, [medicalId], (err, upcomingAppointments) => {
        if (err) {
            // Handle error, send a 500 response
            return res.status(500).json({ error: 'Failed to retrieve upcoming appointments', details: err });
        }

        // If there are no upcoming appointments, return an appropriate message
        if (upcomingAppointments.length === 0) {
            return res.status(404).json({ message: 'No upcoming appointments found for this patient' });
        }

        // Send the list of upcoming appointments in the response
        res.json({
            appointments: upcomingAppointments
        });
    });
});
// app.put('/patient/:id/appointments/:appointmentId/attempt-cancel', (req, res) => {
//     const { appointmentId } = req.params;

//     // Attempt to cancel the appointment by setting isCanceled to 1
//     const attemptCancelQuery = `UPDATE appointment SET isCanceled = 1 WHERE appointment_ID = ?`;

//     db.query(attemptCancelQuery, [appointmentId], (err, results) => {
//         if (err) {
//            /// Log the full error for debugging
//             console.log("Error SQL State:", err.sqlState);
//             console.log("Error Number:", err.errno);
//             // Check if the error is due to the custom trigger error with SQLSTATE 45000 and errno 1644
//             if (err.sqlState === '45000' && err.errno === 1644) {
//                 return res.status(400).json({
//                     message: 'Appointment is within 24 hours. A cancellation fee will apply if you proceed.',
//                     cancellationFee: 50.00,
//                     canProceed: true
//                 });
//             } else {
//                 return res.status(500).json({ message: 'Failed to attempt cancellation.' });
//             }
//         }

//         if (results.affectedRows === 0) {
//             return res.status(404).json({ message: 'Appointment not found or already canceled.' });
//         }

//         // If cancellation is allowed without any trigger errors
//         res.json({
//             message: 'Appointment canceled successfully without a fee.'
//         });
//     });
// });
app.put('/patient/:id/appointments/:appointmentId/attempt-cancel', (req, res) => {
    const { appointmentId } = req.params;

    // Attempt to cancel the appointment by setting isCanceled to 1
    const attemptCancelQuery = `UPDATE appointment SET isCanceled = 1 WHERE appointment_ID = ?`;

    db.query(attemptCancelQuery, [appointmentId], (err, results) => {
        if (err) {
            console.error('Error attempting to cancel appointment:', err);
            return res.status(500).json({ message: 'Failed to attempt cancellation.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Appointment not found or already canceled.' });
        }

        // Step 2: Check the session variable for the fee warning
        const checkWarningQuery = `SELECT @fee_warning AS fee_warning`;
        db.query(checkWarningQuery, (err, results) => {
            if (err) {
                console.error('Error checking fee warning:', err);
                return res.status(500).json({ message: 'Failed to check fee warning.' });
            }

            const feeWarning = results[0].fee_warning;

            if (feeWarning === 1) {
                // Return a 400 response with the penalty confirmation required
                return res.status(400).json({
                    message: 'Appointment is within 24 hours. A cancellation fee will apply if you proceed.',
                    cancellationFee: 50.00,
                    canProceed: true
                });
            } else {
                // Return a 200 response confirming cancellation without a fee
                const updateInvoiceQuery = `
            UPDATE invoice 
            SET amountCharged = 0.00, 
            amountDue = 0.00, 
            services = 'Canceled' 
            WHERE appointment_ID = ?`;
            db.query(updateInvoiceQuery, [appointmentId], (err, results) => {
                if (err) {
                    console.error('Error updating invoice with penalty fee:', err);
                    return res.status(500).send({ message: 'Failed to apply cancellation fee.' });
                }
        
                return res.json({
                    message: 'Appointment canceled successfully without a fee.'
                });
            });
                
                
            }
        });
    });
});
app.put('/patient/:id/appointments/:appointmentId/finalize-cancel', (req, res) => {
    const { appointmentId } = req.params;

    // Apply the penalty fee to the invoice associated with this appointment
    const updateInvoiceQuery = `
        UPDATE invoice 
        SET amountCharged = 50.00, 
            amountDue = 50.00, 
            services = 'Canceled' 
        WHERE appointment_ID = ?`;

    db.query(updateInvoiceQuery, [appointmentId], (err, results) => {
        if (err) {
            console.error('Error updating invoice with penalty fee:', err);
            return res.status(500).send({ message: 'Failed to apply cancellation fee.' });
        }

        res.send({ message: 'Appointment canceled successfully, and cancellation fee applied to invoice.' });
    });
});
app.put('/patient/:id/appointments/:appointmentId/revert-cancel', (req, res) => {
    const { appointmentId } = req.params;

    // Revert the cancellation by setting isCanceled back to 0
    console.log(appointmentId)
    const revertCancelQuery = `UPDATE appointment SET isCanceled = 0 WHERE appointment_ID = ?`;

    db.query(revertCancelQuery, [appointmentId], (err, results) => {
        if (err) {
            console.error('Error reverting cancellation:', err);
            return res.status(500).send({ message: 'Failed to revert cancellation.' });
        }

        res.send({ message: 'Cancellation reverted, appointment remains active.' });
    });
});
function calculateAmountDue(appointmentType) {
    switch (appointmentType) {
        case 'Cardiologist': return 250;
        case 'Gastroenterologist': return 175;
        case 'General Practitioner': return 100;
        case 'Immunologist': return 160;
        case 'Obstetrician': return 180;
        case 'Oncologist': return 200;
        case 'Pediatrician': return 120;
        case 'Radiologist': return 150;
        default: return 0; // Return 0 or handle cases for undefined appointment types
    }
}


app.post('/patient/:id/appointments/create_appointment', (req, res) => {
    const medicalId = req.params.id;
    const {
        patientName, doctorId, nurseId, nurseName, facility, 
        appointmentType, reason, date, timeSlot, patientBillingId
    } = req.body;
    console.log('asdfasdf',date,timeSlot, patientName)
    
    const randomNumber = Math.floor(1000000 + Math.random() * 9000000); // 7-digit number
    const appointment_id = `A${randomNumber}`;

    const datePattern = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    const timePattern = /^(\d{1,2}):(\d{2})\s?(am|pm)$/i; // 12-hour format with am/pm

    if (!datePattern.test(date) || !timePattern.test(timeSlot)) {
        return res.status(400).json({ error: 'Invalid date or time format.' });
    }

    // Convert timeSlot to 24-hour format
    const [, hour, minute, period] = timeSlot.match(timePattern);
    const hour24 = period.toLowerCase() === 'pm' && hour !== '12' ? parseInt(hour) + 12 : period.toLowerCase() === 'am' && hour === '12' ? '00' : hour;
    const formattedDateTime = `${date} ${hour24}:${minute}:00`;
    // First query to retrieve the doctor's name
    console.log('asdf',doctorId)
    const doctorNameQuery = `
        SELECT first_name, last_name
        FROM doctors
        WHERE employee_ID = ?;
    `;

    db.query(doctorNameQuery, [doctorId], (err, doctorResult) => {
        if (err) {
            console.error('Error retrieving doctor name:', err);
            return res.status(500).json({ error: 'Failed to retrieve doctor name.' });
        }
        
        // Ensure a doctor record was found
        if (doctorResult.length === 0) {
            return res.status(404).json({ error: 'Doctor not found.' });
        }
        
        const doctorName = `${doctorResult[0].first_name} ${doctorResult[0].last_name}`;

        // Prepare the SQL query to insert the new appointment
        const query = `
            INSERT INTO appointment 
            (appointment_ID, patientmedicalID, patientName,doctor, nurse, doctorID,
             appointment_type, nurseID, officeID, dateTime, reason,created_at, created_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,NOW(),?);
        `;
        console.log('asdfasdf',formattedDateTime)
        const values = [
            appointment_id,     // appointment_ID
            medicalId,
            patientName,          // patientmedicalID
            doctorName,         // doctor (name of doctor)
            nurseName,          // nurse
            doctorId,           // doctorID
            appointmentType,    // appointment_type
            nurseId,            // nurseID
            facility,           // officeID
            formattedDateTime, // dateTime
            reason,             // reason for the appointment
            medicalId            // created_by (replace with actual user if applicable)
        ];
        console.log('values',values)

        db.query(query, values, (err, result) => {
            if (err) {
                // Check if the error is due to the overdue balance trigger
                if (err.code === 'ER_SIGNAL_EXCEPTION') {
                    return res.status(400).json({ error: 'Cannot create appointment. Patient has an overdue balance older than 30 days.' });
                }
                console.log(err)
                console.error('Error creating appointment:', err);
                return res.status(500).json({ error: 'Failed to create appointment.' });
            }



            const invoiceQuery = `
            INSERT INTO invoice 
            (appointment_ID, appointmentDateTime, patientBillingID, InvoiceID,
            patient_name, patient_insurance, services, amountCharged, amountDue, created) 
            VALUES (?, ?, ?, ?,?, 'Insurnace Co.', ?,?,?, NOW());
        `;

        const invoiceId = `I${Math.floor(1000000 + Math.random() * 9000000)}`; // Random 7-digit invoice ID
        const amountCharged = calculateAmountDue(appointmentType); // Custom function to calculate the amount due based on appointment type

        const invoiceValues = [
            appointment_id,
            formattedDateTime,
            patientBillingId,  
            invoiceId,  
            patientName,
            appointmentType,
            amountCharged,
            amountCharged,    
        ];

        db.query(invoiceQuery, invoiceValues, (err, invoiceResult) => {
            if (err) {
                console.error('Error creating invoice:', err);
                return res.status(500).json({ error: 'Failed to create invoice.' });
            }






            res.status(201).json({ message: 'Appointment created successfully.' });
        });

    });
  });
});

app.get('/patient/:id/appointments/doctors', (req, res) => {
    const medicalId = req.params.id;
    console.log('asdfadfad', medicalId)
    // SQL query to retrieve all doctors of a patient, including specialists
    const getDoctorsQuery = `
        select d.specialty, d.first_name, d.last_name, d.employee_ID
    from (select * from doctors_patient 
    where doctors_patient.patient_ID = ?) as dp 
    left join doctors d 
    on dp.doctor_ID = d.employee_ID;

    `;
    // Execute the query
    db.query(getDoctorsQuery, [medicalId], (err, results) => {
        if (err) {
            // Handle error and return 500 status code with error message
            return res.status(500).json({
                error: 'Failed to retrieve doctors for the patient',
                details: err
            });
        }
        console.log(results)
        // If successful, return the results as a JSON response
        return res.json({
            doctors: results
        });
    });

    
});

app.get('/patient/:id/medical_records/medical_history',(req,res)=>{
    const medicalId = req.params.id;
    
    //this query retrieves all medical records based on medicalId
    const medicalHistoryQuery = `
    select conditions, treatment, diagnosis_date, resolved, medication 
    from medical_history
    where medical_id = ?;
    `
    db.query(medicalHistoryQuery, [medicalId], (err,medicalHistoryData)=>{
        if (err) {
            console.error('Error fetching medical history:', err);
            return res.status(500).json({ error: 'Failed to retrieve medical history' });
        }
        
        // Check if medical history is found
        if (medicalHistoryData.length === 0) {
            return res.status(404).json({ message: 'No medical history found for the provided ID' });
        }

        // Send the medical history data as a response
        res.json({ medicalHistory: medicalHistoryData });
    })
})
app.get('/patient/:id/medical_records/referral_history',(req,res)=>{
    const medicalID = req.params.id
    //retrieves all referrals based on medicalId
    const allReferralQuery = `SELECT r1.status, r1.date_created, r1.reason, 
    doc_origin.first_name as origin_first_name, doc_origin.last_name as origin_last_name, 
    doc_receive.first_name as receive_first_name, doc_receive.last_name as receive_last_name
    FROM (
    SELECT patient_ID, originating_doctor_ID, receiving_doctor_ID ,status, date_created,reason
    FROM referral 
    WHERE patient_ID = ?
    ) AS r1
    LEFT JOIN doctors AS doc_origin 
    ON r1.originating_doctor_ID = doc_origin.employee_ID
    LEFT JOIN doctors AS doc_receive
    ON r1.receiving_doctor_ID = doc_receive.employee_ID;`
    db.query(allReferralQuery, [medicalID], (err, referralData) => {
        if (err) {
            console.error('Error fetching referral summary:', err);
            return res.status(500).json({ error: 'Failed to retrieve referral summary' });
        }

        // If no referrals found, return a 404
        if (referralData.length === 0) {
            return res.status(404).json({ message: 'No referrals found for the provided patient ID' });
        }

        // Return the retrieved referral data
        res.json({ referrals: referralData });
    });
})
app.get('/patient/:id/medical_records/test_history',(req,res)=>{
    const medicalId = req.params.id
    const recentTestsQuery = `
      SELECT test_name, test_date, result
      FROM test_history
      WHERE medical_ID = ?
      ORDER BY test_date DESC
      LIMIT 3;
    `;
    db.query(recentTestsQuery, [medicalId], (err, testHistoryData) => {
        if (err) {
            console.error('Error fetching test history:', err);
            return res.status(500).json({ error: 'Failed to retrieve test history' });
        }

        // If no tests found, return a 404
        if (testHistoryData.length === 0) {
            return res.status(404).json({ message: 'No test history found for the provided medical ID' });
        }

        // Return the retrieved test history data
        res.json({ tests: testHistoryData });
    });
})
app.post('/patient/:id/my_account/password_change', (req, res) => {
    const medicalId = req.params.id;
    const newPassword = req.body.password;
    
    console.log(medicalId, newPassword)
    // Validate the input
    if (!newPassword || newPassword.trim() === '') {
        return res.status(400).send({ message: 'Password is required' });
    }

    // Update the password in the database
    const query = `UPDATE patient_password SET password = ?, last_edited = NOW() WHERE medical_ID = ?;`;
    console.log('password')
    db.query(query, [newPassword, medicalId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ message: 'Database error' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).send({ message: 'Patient not found' });
        }

        res.send({ message: 'Password updated successfully' });
    });
});

app.get('/patient/:id/pay_bill', (req, res) => {
    const medicalId = req.params.id;
    console.log('asdfasdf',medicalId)
    const query = `
        SELECT 
            i.InvoiceID, 
            i.appointmentDateTime, 
            i.patient_insurance, 
            i.amountDue,
            i.created,
            a.doctor, 
            a.officeID,
            (CASE 
                WHEN DATE_ADD(i.created, INTERVAL 30 DAY) < NOW() AND i.amountDue > 0 THEN TRUE 
                ELSE FALSE 
            END) AS is_overdue
        FROM invoice i
        LEFT JOIN appointment a ON i.appointment_ID = a.appointment_ID
        WHERE a.patientmedicalID = ? 
        AND i.amountDue > 0;
    `;

    db.query(query, [medicalId], (err, rows) => {
        if (err) {
            console.error('Error fetching invoices:', err);
            return res.status(500).send({ message: 'Database error' });
        }
        console.log(rows)
        res.json(rows);
    });
});

app.post('/patient/pay_invoice', (req, res) => {
    const { invoiceId, amountPayed, amountDue } = req.body;

    // Validate input
    if (!invoiceId || amountPayed === undefined || amountDue === undefined || isNaN(amountPayed)) {
        return res.status(400).send({ message: 'Invalid input. Please provide valid invoice ID, payment amount, and amount due.' });
    }

    // Convert amountPayed from string to number
    

    
    

    // Ensure the payment doesn't exceed the current amount due
    if (amountPayed > amountDue) {
        return res.status(400).send({ message: 'Payment exceeds the amount due.' });
    }

    const newAmountDue = amountDue - amountPayed;
    console.log('newamoutndue', newAmountDue)
    // Query to update the amountDue
    const updateInvoiceQuery = `UPDATE invoice SET amountDue = ? WHERE InvoiceID = ?`;

    db.query(updateInvoiceQuery, [newAmountDue, invoiceId], (err, result) => {
        if (err) {
            console.error('Error updating invoice:', err);
            return res.status(500).send({ message: 'Database error' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ message: 'Invoice not found' });
        }

        res.send({ message: 'Payment applied successfully', newAmountDue });
    });
});






app.listen(3000, () => console.log('Server running on port 3000! (Connected to backend!)'));
