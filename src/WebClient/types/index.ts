
export enum Role {
  Almoxarife = 'Almoxarife',
  RH = 'RH',
  Colaborador = 'Colaborador',
}

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface AuthResultDto {
  token: string;
  refreshToken: string;
  user: UserDto;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RegisterUserRequestDto {
  fullName: string;
  email: string;
  password: string;
}

export interface ItemDto {
  id: string;
  name: string;
  description: string;
  quantity: number;
  location: string;
  lastMovedBy?: string;
  lastMovement?: Date;
  expirationDate?: Date;
}

export interface CreateItemRequestDto {
  name: string;
  description: string;
  quantity: number;
  location: string;
  expirationDate?: Date;
}

export interface UpdateItemRequestDto {
  name?: string;
  description?: string;
  location?: string;
  expirationDate?: Date;
}

export enum MovementType {
  CHECKIN = 'CHECKIN',
  CHECKOUT = 'CHECKOUT'
}

export interface MovementDto {
    id: string;
    itemId: string;
    userId: string;
    quantity: number;
    type: MovementType;
    date: Date;
    item?: ItemDto;
    user?: UserDto;
}

export interface RegisterMovementRequestDto {
    itemId: string;
    quantity: number;
}
