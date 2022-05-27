// Add a Tarpaulin user to the Tarpaulin database
db = db.getSiblingDB("Tarpaulin")
db.createUser({
    user: "Tarpaulin",
    pwd: "hunter2",
    roles: [ { role: "readWrite", db: "Tarpaulin" }]
});