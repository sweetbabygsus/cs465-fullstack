const mongoose = require('mongoose'); //.set('debug', true);
const Trip = mongoose.model('trips'); // a. Import the Mongoose database library and our schema so it is available to use here.
const User = mongoose.model('users');

// GET: /trips - lists all the trips
// b. Callback method registered in the /api/trips/ route
const tripsList = async (req, res) => {
    Trip
        //c. Use the mongoose .find() method with no filter criteria to return all instances.
        .find({}) //empty filter for all
        .exec((err, trips) => {
            if (!trips) {
                // d. If nothing is returned, send an HTTP 404 status.
                return res
                    .status(404)
                    .json({ "message": "trips not found" });
            } else if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    // e. Finally, if data was retrieved, send it to the client with the HTTP 200 success status.
                    .status(200)
                    .json(trips);
            }
        });
};

// Get: /trips/:tripCode - returns a single trip
// f. Callback method registered in the /api/trips/{tripCode} route
const tripsFindByCode = async (req, res) => {
    Trip
        // g. Use the mongoose .find() method with a filter set to the tripCode passed on the URL.
        .find({ 'code': req.params.tripCode })
        .exec((err, trip) => {
            if (!trip) {
                return res
                    .status(404)
                    .json({ "message": "trip not found" });
            } else if (err) {
                return res
                    .status(404)
                    .json(err);
            } else {
                return res
                    .status(200)
                    .json(trip);
            }
        });
};

const tripsAddTrip = async (req, res) => {
    getUser(req, res,
        (req, res) => {
            Trip
                .create({
                    code: req.body.code,
                    name: req.body.name,
                    length: req.body.length,
                    start: req.body.start,
                    resort: req.body.resort,
                    perPerson: req.body.perPerson,
                    image: req.body.image,
                    description: req.body.description
                },
                (err, trip) => {
                    if (err) {
                        return res
                            .status(400) //bad request, invalid content
                            .json(err);
                    } else {
                        return res
                            .status(201) // created
                            .json(trip);
                    }
                });
            }
    );
}

const tripsUpdateTrip = async (req, res) => {
    getUser(req, res,
        (req, res,) => {
            Trip
                .findOneAndUpdate({ 'code': req.params.tripCode }, {
                    code: req.body.code,
                    name: req.body.name,
                    length: req.body.length,
                    start: req.body.start,
                    resort: req.body.resort,
                    perPerson: req.body.perPerson,
                    image: req.body.image,
                    description: req.body.description
            }, { new: true })
            .then(trip => {
                if (!trip) {
                    return res
                        .status(404)
                        .send({
                            message: "Trip not found with code " + req.params.tripCode
                        });
                }
                res.send(trip);
            }).catch(err => {
                if (err.kind === 'ObjectId') {
                    return res
                        .status(404)
                        .send({
                            message: "Trip not found with code " + req.params.tripCode
                        });
                }
                return res
                    .status(500) // server error
                    .json(err);
        });
    }
    );
}

const getUser = (req, res, callback) => {
    if (req.payload && req.payload.email) {
        User
            .findOne({ email: req.payload.email })
                .exec((err, user) => {
                    if (!user) {
                        return res
                            .status(404)
                            .json({ "message": "User not found" });
                    } else if (err) {
                        console.log(err);
                        return res
                            .status(404)
                            .json(err);
                    }
                    callback(req, res, user.name);
                });
        } else {
            return res  
                .status(404)
                .json({ "message": "User not found" });
        }
    };


module.exports = {
    tripsList,
    tripsFindByCode,
    tripsAddTrip,
    tripsUpdateTrip
};




