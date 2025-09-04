

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
  costCenter?: string;
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
  fullName:string;
  email: string;
  password: string;
  role: Role;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
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
  isEPI?: boolean;
  nextInspectionDate?: Date;
  minStock?: number;
  maxStock?: number;
  requiresMaintenance?: boolean;
  nextMaintenanceDate?: Date;
  cost?: number;
}

export interface CreateItemRequestDto {
  name: string;
  description: string;
  quantity: number;
  location: string;
  expirationDate?: Date;
  isEPI?: boolean;
  nextInspectionDate?: Date;
  minStock?: number;
  maxStock?: number;
  requiresMaintenance?: boolean;
  nextMaintenanceDate?: Date;
}

export interface UpdateItemRequestDto {
  name?: string;
  description?: string;
  location?: string;
  expirationDate?: Date;
  isEPI?: boolean;
  nextInspectionDate?: Date;
  minStock?: number;
  maxStock?: number;
  requiresMaintenance?: boolean;
  nextMaintenanceDate?: Date;
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
    recipientId?: string;
    recipient?: UserDto;
    digitalSignature?: string;
    expectedReturnDate?: Date;
}

export interface RegisterMovementRequestDto {
    itemId: string;
    quantity: number;
    recipientId?: string;
    digitalSignature?: string;
}

export enum AuditActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CHECKIN = 'CHECKIN',
  CHECKOUT = 'CHECKOUT',
}

export interface AuditLogDto {
  id: string;
  userId: string;
  user?: UserDto;
  action: AuditActionType;
  entity: string;
  entityId: string;
  timestamp: Date;
  details: string; // JSON string with old and new values
}

export interface CostByCenterDto {
  costCenter: string;
  totalCost: number;
  movements: MovementDto[];
}
