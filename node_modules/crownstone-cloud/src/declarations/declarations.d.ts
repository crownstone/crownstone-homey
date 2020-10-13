interface requestOptions {
  data?: any,
  noAccessToken?: boolean,
}

type requestType = 'query' | 'body';

interface SwitchData {
  sphereId: string
  stoneId: string,
  type: 'PERCENTAGE' | 'TURN_ON' | 'TURN_OFF'
  percentage?: number,
}

interface StoneSwitchData {
  type: 'PERCENTAGE' | 'TURN_ON' | 'TURN_OFF',
  percentage?: number
}

interface EnergyMeasurementData {
  [stoneCloudId: string] : { t: number, energy: number }[]
}