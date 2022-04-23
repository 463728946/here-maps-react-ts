export interface ILocation {
  lat: number;
  lng: number;
}

export interface IJobPlace {
  location: ILocation;
  duration: number;
  times?: Array<Array<string>>;
  tag?: string;
}

export interface IJobTask {
  places: Array<IJobPlace>;
  demand: Array<number>;
}

export interface IJobTasks {
  pickups?: Array<IJobTask>;
  deliveries?: Array<IJobTask>;
}

export interface IJob {
  id: string;
  tasks: IJobTasks;
  skills?: Array<string>;
  priority?: Array<number>;
  customerId?: Array<string>;
}
export interface IRelation {}
export interface IClustering {}
export interface IRelation {}
export interface IPlan {
  jobs: Array<IJob>;
  relations?: Array<IRelation>;
  clustering?: IClustering;
}

export interface IVehicleLimits {
  //number <double> [ 1 .. 3000000 ]
  //Max distance in meters per shift.
  maxDistance?: number;

  //number <double> [ 1 .. 86400 ]
  //The property shiftTime defines the maximum allowed working time of a vehicle type. In case a break is defined for this particular vehicle type, the duration of the break should be added to the shiftTime. For instance, if a vehicle type has a shift of 8 hours and a 30 minutes break, the total shiftTime should be defined as 8 hours 30 minutes. The properties start.time and end.time on the VehicleShift define the lower and upper bounds of the time interval in which the vehicle's shift must lie. Under no circumstances may a vehicle start working before start.time or finish working after end.time. The start.time and end.time can be imagined as the opening and closing times of a depot where the vehicle starts and ends its tour. start.time and end.time can override the defined shiftTime. That means, in case the time defined by the shiftTime property is longer than the time interval between start.time and end.time the maximum working time of the vehicle will be reduced and will not exceed that time interval.
  shiftTime?: number;
}

export interface IVehiclePlace {
  //string <date-time> (DateAndTime) [ 1 .. 32 ] characters
  //Represents date-time unit as defined by RFC3339.
  time: string;

  //object (Location)
  //Represents geospatial location defined by latitude and longitude.
  location: ILocation;
}

export interface IVehicleBreak {
  //string <date-time> (DateAndTime) [ 1 .. 32 ] characters
  //Represents date-time unit as defined by RFC3339.
  times: Array<string>;

  //integer <int64> (Duration)[ 0 .. 604800 ]
  //Represents duration in seconds.
  duration: Array<Number>;

  //object (Location)
  //Represents geospatial location defined by latitude and longitude.
  location?: Object;
}

export interface IVehicleShift {
  //object (VehiclePlace)
  //Represents a depot: a place where a vehicle starts or ends.
  start: IVehiclePlace;

  //object (VehiclePlace)
  //Represents a depot: a place where a vehicle starts or ends.
  end?: IVehiclePlace;

  //Array of objects (VehicleBreak) 1 items
  breaks?: Array<IVehicleBreak>;
}

export interface IVehicleCosts {
  ///number <double> [ 0 .. 100000 ]
  ///A fixed cost to start using vehicle of this type. It is optional with a default value of zero
  fixed?: number;

  //number <double> [ 0 .. 100000 ]
  //A cost per meter. It is optional with a default value of zero.
  distance?: number;

  //number <double> [ 0 .. 100000 ]
  //A cost per second. It is optional with a default value of zero. In case time and distance costs are zero then a small time cost 0.00000000001 will be used instead
  time?: number;
}
export type TrafficType = "automatic" | "liveOrHistorical" | "historicalOnly";
export type ProfileType =
  | "scooter"
  | "bicycle"
  | "pedestrian"
  | "car"
  | "truck";
export interface IBaseProfile {
  name: string;
  departureTime?: string;
  avoid?: object;
  type: ProfileType;
}
export interface IScooterProfile extends IBaseProfile {
  options?: object;
  exclude?: object;
}
export interface IBicycleProfile extends IBaseProfile {
  exclude?: object;
}
export interface IPedestrianProfile extends IBaseProfile {
  exclude?: object;
}
export interface ICarProfile extends IBaseProfile {
  exclude?: object;
}
export interface ITruckProfile extends IBaseProfile {
  options?: object;
  exclude?: object;
}

export interface IVehicleType {
  //string [ 1 .. 128 ] characters ^[a-zA-Z0-9_-]+$
  //Specifies id of the vehicle type. Avoid assigning real-life identifiers, such as vehicle license plate as the id of a vehicle.
  id: string;

  //string (ProfileName) [ 1 .. 128 ] characters ^[a-zA-Z0-9_-]+$
  //Specifies the name of the profile. Avoid assigning real-life identifiers, such as a vehicle license plate Id or personal name as the profileName of the routing profile.
  profile: string;

  //object (VehicleCosts)
  //Defines different vehicle costs per unit.
  costs: IVehicleCosts;

  //Array of objects (VehicleShift) 1 items
  shifts: Array<IVehicleShift>;

  //Array of integers (Unit) [ 1 .. 10 ]items
  //Unit of measure, e.g. volume, mass, size, etc.
  capacity: Array<number>;

  //Array of strings (Skills) [ 1 .. 100 ] items
  //A list of skills for a vehicle or a job.
  skills?: Array<string>;

  //object (VehicleLimits)
  //Contains constraints applied to a vehicle type.
  limits?: IVehicleLimits;

  //integer [ 1 .. 350 ]
  //Amount of vehicles available.
  amount: number;
}

export interface IFleet {
  //Array of objects (VehicleType) non-empty
  //A list of vehicle types. The upper limit for the number of vehicle types is 35 for the synchronous problems endpoint and 150 for the asynchronous problems endpoint.
  types: Array<IVehicleType>;

  //Array of ScooterProfile (object) or BicycleProfile (object) or PedestrianProfile (object) or CarProfile (object) or TruckProfile (object) (Profile) [ 1 .. 5 ] items
  profiles: Array<
    | IScooterProfile
    | IBicycleProfile
    | IPedestrianProfile
    | ICarProfile
    | ITruckProfile
  >;

  //Default: "automatic"
  //Enum: "liveOrHistorical" "historicalOnly" "automatic"
  traffic?: TrafficType;
}

export default interface ITourPlanningRequest {
  configuration?: object;
  fleet: IFleet;
  plan: IPlan;
}
