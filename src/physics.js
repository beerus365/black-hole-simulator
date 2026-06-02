/* Formula sa black hole is 
    F = G * (M * m) / r^2
*/


function physicsConfig() {
  return {
    F: null, // Gravitational force between two masses (in Newtons)
    G: 6.67430e-11, // Gravitational constant
    M: null, // Mass of the black hole (in kilograms)
    m: null, // Mass of the object being influenced by the black hole (in kilograms)
    r: null, // Distance between the center of the black hole and the object (in meters)
    timeStep: 0.02, // Time step for the simulation (in seconds)
  };
}

export { physicsConfig };

function calculateGravitationalForce(config) {
  const { G, M, m, r } = config;
  return (G * M * m) / (r * r);
}

export { calculateGravitationalForce };

function updatePosition(config, velocity) {
  const { F, m, timeStep } = config;
  const acceleration = F / m; // a = F/m
  return velocity + acceleration * timeStep; // v = v0 + at
}

export { updatePosition };

function updateVelocityVector(config, velocityVector, directionVector) {
  const acceleration = (config.F / config.m) * config.timeStep;
  return velocityVector.clone().add(directionVector.clone().multiplyScalar(acceleration));
}

export { updateVelocityVector };