import { UserResponseDto } from './dto/user-response.dto.js';

type UserRow = {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
};

export function toUserResponse(user: UserRow): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}
