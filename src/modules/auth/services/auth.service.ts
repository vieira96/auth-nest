import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { RoleName } from '@/generated/prisma/client';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { RegisterResponseDto } from '@/modules/auth/dto/register-response.dto';
import { RolesService } from '@/modules/roles/services/roles.service';
import { UsersService } from '@/modules/users/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('E-mail já está em uso.');
    }

    const userRole = await this.rolesService.findByName(RoleName.USER);

    if (!userRole) {
      throw new InternalServerErrorException('A role padrão USER não foi encontrada.');
    }

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });
    
    const user = await this.usersService.createUser({
      name: dto.name,
      email,
      passwordHash,
      roleId: userRole.id,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
