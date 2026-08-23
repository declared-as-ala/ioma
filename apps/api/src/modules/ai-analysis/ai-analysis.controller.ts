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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import type { RoutineTier } from "@ioma/config";
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

  @Get("compare/:prevId/:currId")
  compare(
    @CurrentUser() user: JwtPayload,
    @Param("prevId") prevId: string,
    @Param("currId") currId: string,
  ) {
    return this.aiAnalysisService.compareAnalyses(prevId, currId, user.sub);
  }

  @Get(":id")
  getById(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.aiAnalysisService.getById(id, user.sub);
  }

  @Get(":id/adaptive-questions")
  getAdaptiveQuestions(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.aiAnalysisService.getAdaptiveQuestions(id, user.sub);
  }

  @Post(":id/adaptive-answers")
  submitAdaptiveAnswers(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() body: any,
  ) {
    return this.aiAnalysisService.submitAdaptiveAnswers(id, user.sub, body);
  }

  @Post(":id/select-tier")
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
  submitFollowUp(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() body: any,
  ) {
    return this.aiAnalysisService.submitFollowUp(id, user.sub, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.aiAnalysisService.remove(id, user.sub);
  }
}
