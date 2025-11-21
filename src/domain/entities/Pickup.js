class Pickup {
  constructor(id, tripId, passengerId, passengerName, location, status, estimatedTime) {
    this.id = id;
    this.tripId = tripId;
    this.passengerId = passengerId;
    this.passengerName = passengerName;
    this.location = location;
    this.status = status;
    this.estimatedTime = estimatedTime;
  }
}

export default Pickup;