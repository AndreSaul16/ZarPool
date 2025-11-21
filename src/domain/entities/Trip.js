class Trip {
  constructor(id, driverId, origin, destination, availableSeats, stops, smokingAllowed, departureTime, passengers = []) {
    this.id = id;
    this.driverId = driverId;
    this.origin = origin;
    this.destination = destination;
    this.availableSeats = availableSeats;
    this.stops = stops;
    this.smokingAllowed = smokingAllowed;
    this.departureTime = departureTime;
    this.passengers = passengers;
  }
}

export default Trip;