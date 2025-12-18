import { GoogleGenAI } from "@google/genai";
import { CargoItem, ContainerSpec } from '../types';

export const getGeminiPackingAdvice = async (
  container: ContainerSpec,
  cargoList: CargoItem[]
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const cargoDescription = cargoList.map(c => 
      `- ${c.quantity}개 x ${c.name} (${c.dimensions.width}x${c.dimensions.height}x${c.dimensions.length}mm)`
    ).join('\n');

    const prompt = `
      나는 선박 컨테이너에 화물을 적재하는 작업을 하고 있어.
      컨테이너 타입: ${container.type} (내부 크기: ${container.length}x${container.width}x${container.height} mm).
      
      화물 목록:
      ${cargoDescription}
      
      다음 항목에 대해 전문적인 적재 조언을 한국어로 요약해줘 (최대 300단어):
      1. 예상 적재 효율(%) 및 공간 활용 평가.
      2. 이 화물들의 형태를 고려한 구체적인 적재/스택킹 팁.
      3. 주의사항 (무게 배분, 파손 위험 등).
      4. 답변은 보기 좋은 Markdown 형식으로 작성해줘.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "조언을 생성하지 못했습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 조언을 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};