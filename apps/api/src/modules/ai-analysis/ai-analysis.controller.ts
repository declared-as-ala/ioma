import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import type { RoutineTier } from "@ioma/config";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { AiAnalysisService, MAX_IMAGE_SIZE_BYTES } from "./ai-analysis.service";

@ApiTags("ai-analysis")
@Controller("ai-analysis")
export class AiAnalysisController {
  constructor(private readonly aiAnalysisService: AiAnalysisService) {}

  @Post("consent")
  @UseGuards(JwtAuthGuard)
  recordConsent(@CurrentUser() user: JwtPayload, @Ip() ip: string) {
    return this.aiAnalysisService.recordConsent(user.sub, ip);
  }

  @Delete("consent")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  withdrawConsent(@CurrentUser() user: JwtPayload) {
    return this.aiAnalysisService.withdrawConsent(user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  listMine(@CurrentUser() user: JwtPayload) {
    return this.aiAnalysisService.listMine(user.sub);
  }

  @Get("compare/:prevId/:currId")
  @UseGuards(JwtAuthGuard)
  compare(
    @CurrentUser() user: JwtPayload,
    @Param("prevId") prevId: string,
    @Param("currId") currId: string,
  ) {
    return this.aiAnalysisService.compareAnalyses(prevId, currId, user.sub);
  }

  @Get(":id/image")
  async getImage(@Param("id") id: string, @Res() res: Response) {
    const { buffer, mimeType } = await this.aiAnalysisService.getImageBytes(id);
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Cache-Control", "private, max-age=86400");
    res.send(buffer);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  getById(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.aiAnalysisService.getById(id, user.sub);
  }

  @Get(":id/adaptive-questions")
  @UseGuards(JwtAuthGuard)
  getAdaptiveQuestions(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.aiAnalysisService.getAdaptiveQuestions(id, user.sub);
  }

  @Post(":id/adaptive-answers")
  @UseGuards(JwtAuthGuard)
  submitAdaptiveAnswers(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() body: any,
  ) {
    return this.aiAnalysisService.submitAdaptiveAnswers(id, user.sub, body);
  }

  @Post(":id/select-tier")
  @UseGuards(JwtAuthGuard)
  selectTier(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() body: { tier: RoutineTier },
  ) {
    if (!body?.tier || !["essential", "complete", "premium"].includes(body.tier)) {
      throw new BadRequestException("Invalid routine tier.");
    }
    return this.aiAnalysisService.selectTier(id, user.sub, body.tier);
  }

  @Post(":id/chat")
  @UseGuards(JwtAuthGuard)
  askAdvisor(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() body: { message: string; locale?: "en" | "fr" | "ar" },
  ) {
    if (!body?.message || body.message.trim().length === 0) {
      throw new BadRequestException("Message is required.");
    }
    return this.aiAnalysisService.askAdvisor(
      id,
      user.sub,
      body.message,
      body.locale || "en",
    );
  }

  @Post(":id/follow-up")
  @UseGuards(JwtAuthGuard)
  submitFollowUp(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() body: any,
  ) {
    return this.aiAnalysisService.submitFollowUp(id, user.sub, body);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.aiAnalysisService.remove(id, user.sub);
  }
}
