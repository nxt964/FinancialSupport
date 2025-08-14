// src/hf/hf.module.ts
import { Module } from "@nestjs/common";
import { HfService } from "./hf.service";

@Module({
  providers: [HfService],
  exports: [HfService],
})
export class HfModule {}
