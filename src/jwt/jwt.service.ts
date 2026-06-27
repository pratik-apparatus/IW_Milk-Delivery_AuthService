import { Injectable } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { Secret } from "jsonwebtoken";

export interface JwtPayload {
  sub: string;
  role: string;
  tenantId?: string | null;
  iat?: number;
  exp?: number;
}

export interface OtpSessionPayload {
  phone: string;
  otpHash: string;
  tenantId?: string;
}

@Injectable()
export class JwtService {
  private readonly accessTokenSecret: Secret = process.env.JWT_SECRET;

  private readonly otpTokenSecret: Secret = process.env.OTP_SECRET;

  private readonly resetTokenSecret: Secret = process.env.RESET_SECRET;

  generateAccessToken(payload: {
    sub: string;
    role: string;
    tenantId?: string | null;
  }): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: process.env
        .ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, this.accessTokenSecret) as JwtPayload;
  }

  private normalizeExpiry(
    value: string | undefined,
    fallback: string,
  ): jwt.SignOptions["expiresIn"] {
    const raw = (value || fallback).trim();
    if (/^\d+$/.test(raw)) {
      return `${raw}m` as jwt.SignOptions["expiresIn"];
    }
    return raw as jwt.SignOptions["expiresIn"];
  }

  generateOtpSessionToken(
    phone: string,
    otpHash: string,
    tenantId: string,
  ): string {
    return jwt.sign({ phone, otpHash, tenantId }, this.otpTokenSecret, {
      expiresIn: this.normalizeExpiry(process.env.OTP_SESSION_EXPIRY, "5m"),
    });
  }

  verifyOtpSessionToken(token: string): OtpSessionPayload {
    return jwt.verify(token, this.otpTokenSecret) as OtpSessionPayload;
  }

  generateResetToken(payload: { sub: string; email: string }): string {
    return jwt.sign(payload, this.resetTokenSecret, {
      expiresIn: process.env.RESET_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
    });
  }

  verifyResetToken(token: string): { sub: string; email: string } {
    return jwt.verify(token, this.resetTokenSecret) as {
      sub: string;
      email: string;
    };
  }
}
