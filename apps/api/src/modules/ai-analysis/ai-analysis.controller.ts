import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { AiAnalysisService, MAX_IMAGE_SIZE_BYTES } from "./ai-analysis.service";

@ApiTags("ai-analysis")
@Controller("ai-analysis")
@UseGuards(JwtAuthGuard)
export class AiAnalysisController {
  constructor(private readonly aiAnalysisService: AiAnalysisService) {}

  @Post("consent")
  recordConsent(@CurrentUser() user: JwtPayload, @Ip() ip: string) {
    return this.aiAnalysisService.recordConsent(user.sub, ip);
  }

  @Delete("consent")
  @HttpCode(HttpStatus.NO_CONTENT)
  withdrawConsent(@CurrentUser() user: JwtPayload) {
    return this.aiAnalysisService.withdrawConsent(user.sub);
  }

  @Post()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(
    FileInterceptor("image", { limits: { fileSize: MAX_IMAGE_SIZE_BYTES } }),
  )
  submit(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException("An image file is required.");
    }
    return this.aiAnalysisService.submit(user.sub, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
    });
  }

  @Get("mine")
  listMine(@CurrentUser() user: JwtPayload) {
    return this.aiAnalysisService.listMine(user.sub);
  }

  @Get(":id")
  getById(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.aiAnalysisService.getById(id, user.sub);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.aiAnalysisService.remove(id, user.sub);
  }
}
