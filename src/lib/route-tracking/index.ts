import { calculateDistance, calculateFare, findRoute } from "./utils";

const sampleA = findRoute("Cebu City", "Moalboal");
const sampleB = findRoute("Cebu City", "Bogo City");
const sampleC = findRoute("Carcar City", "Oslob");

if (sampleA) {
  const distance = calculateDistance(sampleA.segment);
  console.log("Cebu City -> Moalboal", {
    route: sampleA.route.name,
    segment: sampleA.segment,
    distanceKm: distance,
    ordinaryFare: calculateFare(distance, "ordinary"),
    airconFare: calculateFare(distance, "aircon"),
  });
}

if (sampleB) {
  const distance = calculateDistance(sampleB.segment);
  console.log("Cebu City -> Bogo City", {
    route: sampleB.route.name,
    segment: sampleB.segment,
    distanceKm: distance,
    ordinaryFare: calculateFare(distance, "ordinary"),
    airconFare: calculateFare(distance, "aircon"),
  });
}

if (sampleC) {
  const distance = calculateDistance(sampleC.segment);
  console.log("Carcar City -> Oslob", {
    route: sampleC.route.name,
    segment: sampleC.segment,
    distanceKm: distance,
    ordinaryFare: calculateFare(distance, "ordinary"),
    airconFare: calculateFare(distance, "aircon", true),
  });
}
