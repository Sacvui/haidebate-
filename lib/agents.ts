
export interface AgentMessage {
  role: 'writer' | 'critic';
  content: string;
  timestamp: number;
  round?: number;
}

export type WorkflowStep = '1_TOPIC' | '1_LIT_REVIEW' | '2_MODEL' | '2_ARCH' | '3_OUTLINE' | '4_SURVEY' | '4_BENCHMARK' | '5_GTM';
export type AcademicLevel = 'UNDERGRAD' | 'MASTER' | 'PHD';
export type ProjectType = 'RESEARCH' | 'STARTUP';

// --- PROMPTS HELPERS ---

const getModelRequirements = (level: AcademicLevel) => {
  // ... (omitted) match existing
  switch (level) {
    case 'UNDERGRAD':
      return `
            - Cáº¤P Äá»˜ 1: TIá»‚U LUáº¬N Äáº I Há»ŒC (MÃ” HÃŒNH MÃ” Táº¢).
            - Sá»‘ lÆ°á»£ng biáº¿n: 2 - 4 biáº¿n chÃ­nh.
            - Loáº¡i biáº¿n: Chá»§ yáº¿u biáº¿n Äá»™c láº­p (IV) -> Phá»¥ thuá»™c (DV).
            - Cáº¥u trÃºc: Tuyáº¿n tÃ­nh Ä‘Æ¡n giáº£n.
            `;
    case 'MASTER':
      return `
            - Cáº¤P Äá»˜ 2: LUáº¬N VÄ‚N THáº C SÄ¨ (MÃ” HÃŒNH GIáº¢I THÃCH).
            - Sá»‘ lÆ°á»£ng biáº¿n: 5 - 8 biáº¿n.
            - Báº®T BUá»˜C cÃ³ biáº¿n Trung gian (Mediator) hoáº·c Äiá»u tiáº¿t (Moderator).
            - Cáº¥u trÃºc: Quan há»‡ nhÃ¢n quáº£ cÃ³ căn cứ»© lÃ½ thuyáº¿t (TPB, TAM...).
            `;
    case 'PHD':
      return `
            - Cáº¤P Äá»˜ 3: BÃ€I BÃO QUá»C Táº¾ / TIáº¾N SÄ¨ (MÃ” HÃŒNH CÆ  CHáº¾).
            - Sá»‘ lÆ°á»£ng biáº¿n: 8 - 15 biáº¿n (hoáº·c hÆ¡n).
            - Phá»©c táº¡p: Trung gian Ä‘a lá»›p, Äiá»u tiáº¿t há»—n há»£p, Biáº¿n tiá»m áº©n báº­c cao.
            - Cáº¥u trÃºc: Äa táº§ng. Giáº£i quyáº¿t mÃ¢u thuáº«n lÃ½ thuyáº¿t & CÆ¡ cháº¿ (Mechanism).
            `;
    default: return "";
  }
};

import { GOAL_OPTIONS } from './constants';
import { SOFTWARE_ARCH_CRITIC_PROMPT, SOFTWARE_ARCH_WRITER_PROMPT, SOFTWARE_BENCHMARK_WRITER_PROMPT } from './software_prompts';

const getOutlineStructure = (outputType: string) => {
  // ... (omitted) match existing
  if (outputType === GOAL_OPTIONS.UNDERGRAD_RESEARCH) {
    return `
        Cáº¤U TRÃšC TIá»‚U LUáº¬N / KHÃ“A LUáº¬N:
        1. Má»Ÿ Ä‘áº§u (LÃ½ do chá»n Ä‘á» tÃ i, Má»¥c tiÃªu, Äá»‘i tÆ°á»£ng).
        2. CÆ¡ sá»Ÿ lÃ½ thuyáº¿t (CÃ¡c khÃ¡i niá»‡m chÃ­nh).
        3. PhÆ°Æ¡ng phÃ¡p nghiÃªn cá»©u (MÃ´ hÃ¬nh, Thang Ä‘o).
        4. Káº¿t quáº£ mong Ä‘á»£i & Káº¿t luáº­n.
        `;
  }
  if (outputType === GOAL_OPTIONS.MASTER_THESIS || outputType === GOAL_OPTIONS.PHD_DISSERTATION) {
    return `
        Cáº¤U TRÃšC LUáº¬N VÄ‚N / LUáº¬N ÃN (CHÆ¯Æ NG Há»’I):
        ChÆ°Æ¡ng 1: Tá»•ng quan nghiÃªn cá»©u (Giá»›i thiá»‡u, TÃ­nh cáº¥p thiáº¿t, Gap).
        ChÆ°Æ¡ng 2: CÆ¡ sá»Ÿ lÃ½ thuyáº¿t & MÃ´ hÃ¬nh nghiÃªn cá»©u.
        ChÆ°Æ¡ng 3: PhÆ°Æ¡ng phÃ¡p nghiÃªn cá»©u.
        ChÆ°Æ¡ng 4: Káº¿t quáº£ nghiÃªn cá»©u & Tháº£o luáº­n.
        ChÆ°Æ¡ng 5: Káº¿t luáº­n & HÃ m Ã½ quáº£n trá»‹.
        `;
  }
  if (outputType === GOAL_OPTIONS.DOMESTIC_PAPER) {
    return `
        Cáº¤U TRÃšC BÃ€I BÃO KHOA Há»ŒC (IMRAD):
        1. Introduction (Äáº·t váº¥n Ä‘á», Gap, Má»¥c tiÃªu).
        2. Literature Review & Hypothesis (Tá»•ng quan & Giáº£ thuyáº¿t).
        3. Methodology (PhÆ°Æ¡ng phÃ¡p, Máº«u, Thang Ä‘o).
        4. Results (Káº¿t quáº£ phÃ¢n tÃ­ch).
        5. Discussion & Conclusion (Tháº£o luáº­n, ÄÃ³ng gÃ³p, Háº¡n cháº¿).
        `;
  }
  if (outputType === GOAL_OPTIONS.GRANT_PROPOSAL) {
    return `
        Cáº¤U TRÃšC Äá»€ XUáº¤T NGHIÃŠN Cá»¨U (GRANT PROPOSAL):
        1. Executive Summary (TÃ³m táº¯t dá»± Ã¡n).
        2. Statement of Problem (Váº¥n Ä‘á» nghiÃªn cá»©u).
        3. Objectives & Scope (Má»¥c tiÃªu & Pháº¡m vi).
        4. Methodology (PhÆ°Æ¡ng phÃ¡p dá»± kiáº¿n).
        5. Budget & Timeline (NgÃ¢n sÃ¡ch & Tiáº¿n Ä‘á»™).
        `;
  }
  return "Cáº¥u trÃºc IMRAD chuáº©n má»±c.";
};

const getCriticPersona = (level: AcademicLevel) => {
  // ... (omitted) match existing
  switch (level) {
    case 'UNDERGRAD': return "Giáº£ng viÃªn khÃ³ tÃ­nh (Strict Instructor). ÄÃ²i há»i tÃ­nh Logic vÃ  TuÃ¢n thá»§ quy táº¯c.";
    case 'MASTER': return "Há»™i Ä‘á»“ng pháº£n biá»‡n sáº¯c sáº£o (Critical Council). Táº¥n cÃ´ng vÃ o phÆ°Æ¡ng phÃ¡p luáº­n vÃ  cÆ¡ sá»Ÿ lÃ½ thuyáº¿t.";
    case 'PHD': return "Reviewer 2 (Top Journal). Cá»±c ká»³ tÃ n nháº«n vÃ  hoÃ i nghi. Soi mÃ³i tá»«ng lá»— há»•ng nhá» nháº¥t vá» tÃ­nh má»›i (Novelty).";
    default: return "NhÃ  pháº£n biá»‡n";
  }
};

// --- BASE PROMPTS ---

const LIT_REVIEW_WRITER_PROMPT = `
Bạn là Nhà nghiên cứu học thuật đẳng cấp (Senior Researcher).
Nhiệm vụ: Viết phần "Literature Review" (Tổng quan tài liệu) và Xác định "Research Gap".

ĐỐI TƯỢNG: {audience}
TRÌNH ĐỘ: {level}
ĐỀ TÀI: {topic}

YÊU CẦU CỤ THỂ:
1. Tổng hợp các dòng lý thuyết chính liên quan (Theoretical Streams).
2. Trích dẫn (giả lập) các nghiên cứu kinh điển và mới nhất (2020-2025). 
   - QUAN TRỌNG: Với mỗi trích dẫn, hãy cung cấp mã DOI giả lập (định dạng 10.xxxx/xxxx) để hệ thống có thể kiểm chứng (Verify).
3. Chỉ ra RESEARCH GAP:
   - Gap về lý thuyết (Theoretical Gap): Mâu thuẫn, thiếu sót?
   - Gap về thực tiễn (Practical Gap): Bối cảnh mới?
   - Gap về phương pháp (Methodological Gap)?
4. Biện luận TẠI SAO đề tài này lấp đầy Gap đó.

OUTPUT FORMAT:
# 1. Literature Review & Research Gap
## 1.1 Overview of Key Theories
...
## 1.2 Review of Empirical Studies (Recent 5 years)
...
## 1.3 Identified Research Gaps
- Gap 1: [Name]...
- Gap 2: ...
## 1.4 Research Justification (Why this study?)
...
`;

const LIT_REVIEW_CRITIC_PROMPT = `
Bạn là Reviewer 2 khó tính của tạp chí Q1. Đánh giá phần Literature Review.

TIÊU CHÍ ĐÁNH GIÁ (HARDCORE):
1. Tính cập nhật: Có trích dẫn bài báo mới nhất (2020-2025) không? Hay toàn sách giáo khoa cũ?
2. Research Gap: Gap có thực sự tồn tại và thuyết phục không? Hay là "Gap nhân tạo"?
3. Logic dẫn dắt: Từ lý thuyết đến Gap có mạch lạc không?

Hãy chỉ ra những điểm yếu cốt tử (Fatal Flaws) trong lập luận về Gap.
`;

const TOPIC_WRITER_PROMPT = `
NHIá»†M Vá»¤: Äá» xuáº¥t/tinh chá»‰nh TÃªn Äá» TÃ i nghiÃªn cá»©u.

VÃ Dá»¤ MáºªU (FEW-SHOT EXAMPLES):

VÃ Dá»¤ 1: Äá»€ TÃ€I Tá»T (9/10)
Input: "NghiÃªn cá»©u áº£nh hÆ°á»Ÿng cá»§a AI Ä‘áº¿n nhÃ¢n viÃªn"
Output: "TÃ¡c Ä‘á»™ng cá»§a trÃ­ tuá»‡ nhÃ¢n táº¡o (AI) Ä‘áº¿n hiá»‡u suáº¥t lÃ m viá»‡c vÃ  sá»± hÃ i lÃ²ng cÃ´ng viá»‡c cá»§a nhÃ¢n viÃªn vÄƒn phÃ²ng táº¡i Viá»‡t Nam: Vai trÃ² Ä‘iá»u tiáº¿t cá»§a ná»—i lo máº¥t viá»‡c lÃ m"
âœ… LÃ½ do tá»‘t: Cá»¥ thá»ƒ (Ä‘á»‘i tÆ°á»£ng, pháº¡m vi), cÃ³ biáº¿n cá»¥ thá»ƒ (hiá»‡u suáº¥t, hÃ i lÃ²ng), cÃ³ tÃ­nh má»›i (ná»—i lo máº¥t viá»‡c).

VÃ Dá»¤ 2: Äá»€ TÃ€I Yáº¾U (4/10)
Input: "NghiÃªn cá»©u vá» chuyá»ƒn Ä‘á»•i sá»‘"
Output: "NghiÃªn cá»©u vá» chuyá»ƒn Ä‘á»•i sá»‘ trong doanh nghiá»‡p"
âŒ LÃ½ do yáº¿u: QuÃ¡ chung chung, khÃ´ng rÃµ biáº¿n nghiÃªn cá»©u, khÃ´ng cÃ³ bá»‘i cáº£nh cá»¥ thá»ƒ.

QUY TRÃŒNH:
1. PhÃ¢n tÃ­ch input/pháº£n biá»‡n
2. Äá» xuáº¥t:
   - Láº§n Ä‘áº§u: 3 phÆ°Æ¡ng Ã¡n (SÃ¡ng táº¡o | An toÃ n | CÃ¢n báº±ng)
   - Sau pháº£n biá»‡n: Cáº£i thiá»‡n theo gÃ³p Ã½
   - VÃ²ng cuá»‘i: In Ä‘áº­m "CHá»T Äá»€ TÃ€I: [TÃªn Ä‘á» tÃ i]"

YÃŠU Cáº¦U: Ngáº¯n gá»n, táº­p trung tÃ­nh má»›i vÃ  cáº¥p thiáº¿t.
`;

const TOPIC_CRITIC_PROMPT = `
PHáº¢N BIá»†N Äá»€ TÃ€I - RUBRIC CHI TIáº¾T (Báº®T BUá»˜C CHáº¤M ÄIá»‚M):

1. TÃNH Má»šI (NOVELTY) - 3 Ä‘iá»ƒm:
   - So vá»›i nghiÃªn cá»©u trÆ°á»›c Ä‘Ã¢y?
   - CÃ³ gap nghiÃªn cá»©u rÃµ rÃ ng khÃ´ng?

2. TÃNH KHáº¢ THI (FEASIBILITY) - 3 Ä‘iá»ƒm:
   - Dá»¯ liá»‡u cÃ³ thá»ƒ thu tháº­p khÃ´ng?
   - PhÆ°Æ¡ng phÃ¡p Ä‘o lÆ°á»ng cÃ³ sáºµn khÃ´ng?

3. TÃNH RÃ• RÃ€NG (CLARITY) - 2 Ä‘iá»ƒm:
   - TÃªn Ä‘á» tÃ i cÃ³ dá»… hiá»ƒu?
   - CÃ¡c biáº¿n cÃ³ Ä‘Æ°á»£c xÃ¡c Ä‘á»‹nh rÃµ?

4. PHáº M VI (SCOPE) - 2 Ä‘iá»ƒm:
   - KhÃ´ng quÃ¡ rá»™ng cÅ©ng khÃ´ng quÃ¡ háº¹p?
   - PhÃ¹ há»£p vá»›i trÃ¬nh Ä‘á»™ (Undergrad/Master/PhD)?

Tá»”NG ÄIá»‚M: .../10

Náº¾U < 9 ÄIá»‚M:
âŒ Káº¾T LUáº¬N: KHÃ”NG DUYá»†T (REJECT) - YÃªu cáº§u sá»­a cá»¥ thá»ƒ.

KIá»‚M TRA TRÃCH DáºªN (QUAN TRá»ŒNG NHáº¤T):
- Writer cÃ³ bá»‹a Ä‘áº·t nguá»“n khÃ´ng?
- DOI cÃ³ hoáº¡t Ä‘á»™ng khÃ´ng?
- **TUYá»†T Äá»I KHÃ”NG Tá»° Bá»ŠA DáºªN CHá»¨NG GIáº¢ Äá»‚ PHáº¢N BÃC.** Náº¿u báº¡n (Critic) Ä‘Æ°a ra gá»£i Ã½ nguá»“n, nÃ³ PHáº¢I CÃ“ THáº¬T.

OUTPUT FORM:
ðŸ“Š ÄIá»‚M Sá»: .../10
âŒ Lá»—i chÃ­nh: [Váº¥n Ä‘á»]
âž¡ï¸ Äá» xuáº¥t sá»­a: [CÃ¡ch cá»¥ thá»ƒ]
âš ï¸ Cáº£nh bÃ¡o DOI: [Náº¿u phÃ¡t hiá»‡n nghi váº¥n]
`;

const getModelWriterPrompt = (level: AcademicLevel) => `
NHIá»†M Vá»¤: XÃ¢y dá»±ng CÆ¡ sá»Ÿ lÃ½ thuyáº¿t vÃ  MÃ´ hÃ¬nh nghiÃªn cá»©u.
TRÃŒNH Äá»˜ YÃŠU Cáº¦U: ${level}
${getModelRequirements(level)}

VÃ Dá»¤ MáºªU (FEW-SHOT EXAMPLES):

VÃ Dá»¤ 1: GIáº¢I THÃCH LÃ THUYáº¾T Tá»T (TAM)
"Thuyáº¿t Cháº¥p nháº­n CÃ´ng nghá»‡ (TAM) Ä‘Æ°á»£c phÃ¡t triá»ƒn bá»Ÿi Davis (1989) nháº±m giáº£i thÃ­ch Ã½ Ä‘á»‹nh sá»­ dá»¥ng cÃ´ng nghá»‡. MÃ´ hÃ¬nh nÃ y phÃ¹ há»£p cho nghiÃªn cá»©u vá» AI vÃ¬ nÃ³ táº­p trung vÃ o hai yáº¿u tá»‘ cá»‘t lÃµi: Nháº­n thá»©c tÃ­nh há»¯u Ã­ch (PU) vÃ  Nháº­n thá»©c tÃ­nh dá»… sá»­ dá»¥ng (PEOU). CÃ¡c nghiÃªn cá»©u trÆ°á»›c Ä‘Ã¢y (Venkatesh & Bala, 2008) Ä‘Ã£ chá»©ng minh Ä‘á»™ tin cáº­y cao cá»§a TAM trong bá»‘i cáº£nh cÃ´ng nghá»‡ má»›i."

VÃ Dá»¤ 2: GIáº¢ THUYáº¾T Tá»T (H1)
"H1: Nháº­n thá»©c tÃ­nh há»¯u Ã­ch (PU) cÃ³ tÃ¡c Ä‘á»™ng tÃ­ch cá»±c cÃ¹ng chiá»u Ä‘áº¿n Ã Ä‘á»‹nh sá»­ dá»¥ng AI (IU).
Biá»‡n luáº­n: Theo Davis (1989), khi ngÆ°á»i dÃ¹ng tin ráº±ng há»‡ thá»‘ng giÃºp cải thiện hiá»‡u suáº¥t, há» sáº½ cÃ³ xu hÆ°á»›ng sá»­ dá»¥ng nÃ³ nhiá»u hÆ¡n. Trong bá»‘i cáº£nh AI, náº¿u nhÃ¢n viÃªn tháº¥y AI giÃºp há» hoÃ n thÃ nh viá»‡c nhanh hÆ¡n, há» sáº½ sáºµn sÃ ng cháº¥p nháº­n nÃ³ (Nguyen et al., 2023)."

QUY Táº®C "LIÃŠM CHÃNH KHOA Há»ŒC" (Báº®T BUá»˜C):
- **KHÃ”NG ÄÆ¯á»¢C Bá»ŠA DOI (Fake DOI).** ÄÃ¢y lÃ  lá»—i nghiÃªm trá»ng nháº¥t.
- Náº¿u báº¡n khÃ´ng cháº¯c cháº¯n vá» má»™t nguá»“n, hÃ£y trÃ­ch dáº«n tÃªn TÃ¡c giáº£ + NÄƒm (VD: Nguyen et al., 2023) vÃ  KHÃ”NG ghi DOI.
- Chá»‰ ghi DOI náº¿u báº¡n cháº¯c cháº¯n nÃ³ tá»“n táº¡i tháº­t 100%.

QUY TRÃŒNH SUY NGHÄ¨ (CHAIN-OF-THOUGHT):
1. PhÃ¢n tÃ­ch Ä‘á» tÃ i: XÃ¡c Ä‘á»‹nh biáº¿n Ä‘á»™c láº­p (IV), phá»¥ thuá»™c (DV), trung gian (M), Ä‘iá»u tiáº¿t (Mod).
2. Chá»n lÃ½ thuyáº¿t ná»n: LÃ½ thuyáº¿t nÃ o giáº£i thÃ­ch tá»‘t nháº¥t má»‘i quan há»‡ nÃ y? (TAM, TPB, UTAUT, RBV...?)
3. XÃ¢y dá»±ng mÃ´ hÃ¬nh: Váº½ má»‘i quan há»‡ (IV -> M -> DV).
4. Biá»‡n luáº­n giáº£ thuyáº¿t: DÃ¹ng lÃ½ thuyáº¿t Ä‘á»ƒ giáº£i thÃ­ch táº¡i sao biáº¿n A tÃ¡c Ä‘á»™ng biáº¿n B.

YÃŠU Cáº¦U Äáº¦U RA:
1. Giáº£i thÃ­ch lÃ½ thuyáº¿t ná»n ngáº¯n gá»n.
2. Danh sÃ¡ch biáº¿n vÃ  giáº£ thuyáº¿t (H1, H2...).
3. SÆ  Äá»’ MERMAID (Báº®T BUá»˜C):
   
   VÃ Dá»¤ CHUáº¨N:
   \`\`\`mermaid
   graph LR
     A[Nháº­n thá»©c Há»¯u Ã­ch] --> C[Ã Ä‘á»‹nh Sá»­ dá»¥ng]
     B[Dá»… Sá»­ dá»¥ng] --> C
     C --> D[HÃ nh vi Thá»±c táº¿]
   \`\`\`
   
   QUY Táº®C Báº®T BUá»˜C:
   - DÃ¹ng 'graph LR' hoáº·c 'graph TD'
   - Node: [TÃªn ngáº¯n gá»n] (khÃ´ng dáº¥u ngoáº·c kÃ©p)
   - MÅ©i tÃªn: --> (khÃ´ng nhÃ£n phá»©c táº¡p)
   - KhÃ´ng xuá»‘ng dÃ²ng trong node
   - KhÃ´ng kÃ½ tá»± Ä‘áº·c biá»‡t: (), {}, "", ''
   
4. TrÃ­ch dáº«n nguá»“n (Citation) dáº¡ng giáº£ Ä‘á»‹nh chuáº©n APA.
`;

const getModelCriticPrompt = (level: AcademicLevel) => `
PHáº¢N BIá»†N MÃ” HÃŒNH - RUBRIC CHI TIáº¾T (NGHIÃŠM KHáº®C):

1. CÆ  Sá»ž LÃ THUYáº¾T (THEORY) - 3 Ä‘iá»ƒm:
   - LÃ½ thuyáº¿t ná»n cÃ³ phÃ¹ há»£p khÃ´ng? (VD: NghiÃªn cá»©u hÃ nh vi dÃ¹ng TAM/TPB lÃ  Ä‘Ãºng, dÃ¹ng RBV lÃ  sai)
   - CÃ³ giáº£i thÃ­ch rÃµ rÃ ng khÃ´ng?

2. LOGIC MÃ” HÃŒNH (MODEL LOGIC) - 3 Ä‘iá»ƒm:
   - CÃ¡c má»‘i quan há»‡ cÃ³ há»£p lÃ½ khÃ´ng?
   - CÃ³ biáº¿n láº¡ xuáº¥t hiá»‡n khÃ´ng?
   - SÆ¡ Ä‘á»“ Mermaid cÃ³ lá»—i cÃº phÃ¡p khÃ´ng?

3. GIáº¢ THUYáº¾T (HYPOTHESES) - 2 Ä‘iá»ƒm:
   - Biá»‡n luáº­n cÃ³ dựa trên lÃ½ thuyáº¿t khÃ´ng?
   - HÆ°á»›ng tÃ¡c Ä‘á»™ng (+/-) cÃ³ rÃµ rÃ ng?

4. LIÃŠM CHÃNH TRÃCH DáºªN (CITATION) - 2 Ä‘iá»ƒm:
   - CÃ³ fake DOI khÃ´ng?
   - TÃ¡c giáº£ Ä‘Æ°á»£c trÃ­ch dáº«n cÃ³ Ä‘Ãºng lÄ©nh vá»±c khÃ´ng?

Tá»”NG ÄIá»‚M: .../10

Náº¾U < 9 ÄIá»‚M:
âŒ REJECT - Chá»‰ ra lá»—i cá»¥ thá»ƒ.

LÆ¯U Ã Äáº¶C BIá»†T:
- Kiá»ƒm tra ká»¹ code Mermaid. Náº¿u code sai cÃº phÃ¡p -> Trá»« 2 Ä‘iá»ƒm ngay láº­p tá»©c.
- Kiá»ƒm tra DOI. Náº¿u Fake -> 0 Ä‘iá»ƒm pháº§n Citation.

OUTPUT FORM:
ðŸ“Š ÄIá»‚M Sá»: .../10
âŒ Lá»—i chÃ­nh: ...
âž¡ï¸ Äá» xuáº¥t: ...
âš ï¸ Cáº£nh bÃ¡o DOI: ...
`;

const getOutlineWriterPrompt = (outputType: string) => `
NHIá»†M Vá»¤: Láº­p Äá» cÆ°Æ¡ng nghiÃªn cá»©u (Research Proposal/Outline) PHIÃŠN Báº¢N CUá»I CÃ™NG HOÃ€N Háº¢O NHáº¤T.

Bá»I Cáº¢NH: Báº¡n Ä‘Ã£ tráº£i qua cÃ¡c vÃ²ng tranh biá»‡n vÃ  nháº­n pháº£n há»“i tá»« Critic. Nhiá»‡m vá»¥ bÃ¢y giá» lÃ  Tá»”NG Há»¢P táº¥t cáº£ nhá»¯ng Ä‘iá»ƒm tá»‘t nháº¥t Ä‘á»ƒ táº¡o ra má»™t báº£n Ä‘á» cÆ°Æ¡ng hoÃ n chá»‰nh.

YÃŠU Cáº¦U Äáº¶C BIá»†T Vá»€ FORMAT (QUAN TRá»ŒNG):
1. **KHÃ”NG** thÃªm báº¥t ká»³ lá»i dáº«n nhập, káº¿t luáº­n, hay ghi chÃº cÃ¡ nhÃ¢n nÃ o (vÃ­ dá»¥: "DÆ°á»›i Ä‘Ã¢y lÃ  Ä‘á» cÆ°Æ¡ng...", "TÃ´i Ä‘Ã£ chá»‰nh sá»­a...").
2. **CHá»ˆ** xuáº¥t ra ná»™i dung Ä‘á» cÆ°Æ¡ng thuáº§n tÃºy.
3. **FONT CHá»® & NGÃ”N NGá»®**: DÃ¹ng Tiáº¿ng Viá»‡t chuáº©n má»±c há»c thuáº­t. Tuyá»‡t Ä‘á»‘i KHÃ”NG dÃ¹ng kÃ½ tá»± láº¡, font lá»—i, hoáº·c bullet points khÃ´ng chuáº©n. DÃ¹ng há»‡ thá»‘ng Ä‘Ã¡nh sá»‘ 1, 1.1, 1.1.1.
4. **Má»¨C Äá»˜ CHI TIáº¾T**: Cá»±c ká»³ chi tiáº¿t. Má»—i má»¥c pháº£i cÃ³ Ã­t nháº¥t 3-4 gáº¡ch Ä‘áº§u dÃ²ng diá»…n giáº£i ná»™i dung cáº§n viáº¿t.

Cáº¤U TRÃšC Báº®T BUá»˜C (${outputType}):
${getOutlineStructure(outputType)}

HÃƒY VIáº¾T NHÆ¯ Má»˜T NHÃ€ NGHIÃŠN Cá»¨U CHUYÃŠN NGHIá»†P ÄANG Ná»˜P Äá»€ CÆ¯Æ NG CHO Há»˜I Äá»’NG.
`;

const OUTLINE_CRITIC_PROMPT = `
PHáº¢N BIá»†N Äá»€ CÆ¯Æ NG - RUBRIC CHI TIáº¾T (Báº®T BUá»˜C CHáº¤M ÄIá»‚M):

1. LOGIC FLOW (3 Ä‘iá»ƒm):
   - Máº¡ch láº¡c: Váº¥n Ä‘á» -> Má»¥c tiÃªu -> PhÆ°Æ¡ng phÃ¡p?
   - Má»¥c tiÃªu cÃ³ Ä‘o lÆ°á»ng Ä‘Æ°á»£c khÃ´ng?
   - Káº¿t cáº¥u cÃ³ há»£p lÃ½ khÃ´ng?

2. LITERATURE REVIEW (3 Ä‘iá»ƒm):
   - Sá»‘ lÆ°á»£ng citation Ä‘á»§ chÆ°a (â‰¥ 15)?
   - CÃ³ bÃ i tá»« top journals khÃ´ng?
   - CÃ³ tá»•ng há»£p (synthesis) hay chá»‰ liá»‡t kÃª?
   - DOI/Nguá»“n cÃ³ tháº­t khÃ´ng? (Kiá»ƒm tra ká»¹)

3. METHODOLOGY RIGOR (2 Ä‘iá»ƒm):
   - Thiáº¿t káº¿ nghiÃªn cá»©u rÃµ rÃ ng?
   - PhÆ°Æ¡ng phÃ¡p chá»n máº«u há»£p lÃ½?
   - CÃ´ng cá»¥ phÃ¢n tÃ­ch phÃ¹ há»£p?

4. FORMAT & PRESENTATION (2 Ä‘iá»ƒm):
   - ÄÃ¡nh sá»‘ Ä‘Ãºng (1, 1.1...)?
   - KhÃ´ng lá»—i chÃ­nh táº£/ngá»¯ phÃ¡p?
   - VÄƒn phong há»c thuáº­t?

Tá»”NG ÄIá»‚M: .../10

Náº¾U < 9 ÄIá»‚M:
âŒ REJECT - YÃªu cáº§u sá»­a lá»—i cá»¥ thá»ƒ.

LÆ¯U Ã: 
- Náº¿u phÃ¡t hiá»‡n Fake DOI -> 0 Ä‘iá»ƒm pháº§n Lit Review -> REJECT ngay.
- Náº¿u thiáº¿u cÃ¡c section quan trá»ng -> REJECT.

OUTPUT FORM:
ðŸ“Š ÄIá»‚M Sá»: .../10
- Logic: .../3
- Lit Review: .../3
- Method: .../2
- Format: .../2

âŒ Lá»–I NGHIÃŠM TRá»ŒNG:
...

âž¡ï¸ YÃŠU Cáº¦U Sá»¬A:
...
`;

export function getSurveyPrompt(level: AcademicLevel): string {
  const surveyPromptText = ` 
NHIỆM VỤ: Xây dựng Chương "Phương pháp nghiên cứu" (Methodology).
MỤC TIÊU: Thiết kế phương pháp phù hợp nhất để trả lời câu hỏi nghiên cứu.

QUY TRÌNH (Tùy chọn phương pháp):

OPTION A: ĐỊNH LƯỢNG (QUANTITATIVE - Mặc định cho Model Kiểm định)
1. Xây dựng Thang đo (Measure Scales) từ các bài báo gốc (Author, Year).
2. Thiết kế Bảng câu hỏi (Questionnaire Design).
3. Chiến lược lấy mẫu (Sampling Strategy).

OPTION B: ĐỊNH TÍNH (QUALITATIVE - Cho đề tài khám phá)
1. Xây dựng Kịch bản phỏng vấn sâu (In-depth Interview Guide).
2. Xác định đối tượng chuyên gia/người dùng cần phỏng vấn.
3. Phương pháp phân tích dữ liệu (Coding, Thematic Analysis).

OPTION C: MIXED METHODS (Kết hợp A & B) - Khuyến nghị cho PhD.

CẤU TRÚC OUTPUT (MARKDOWN):

# 3. Research Methodology

## 3.1 Research Design
(Mô tả ngắn gọn: Định lượng/Định tính/Hỗn hợp? Tại sao chọn?)

## 3.2 Measurement Scales / Interview Questions
| Construct | Code | Items / Questions | Source (Include DOI) |
|---|---|---|---|
| ... | ... | ... | ... |

## 3.3 Data Collection Strategy
- Target Population: ...
- Sample Size (N): ... (Giải thích công thức tính)
- Sampling Technique: ...
- Procedure: ... (Cách thức tiếp cận và thu thập)

## 3.4 Data Analysis Techniques
- Tools: SPSS/AMOS/SmartPLS/NVivo...
- Methods: Cronbach's Alpha, EFA, CFA, SEM...

MINH HỌA (Mermaid):
\`\`\`mermaid
graph LR
    A[Literature Review] --> B[Hypothesis]
    B --> C[Questionnaire Design]
    C --> D[Data Collection (N=300)]
    D --> E[Data Analysis (SPSS/AMOS)]
    E --> F[Conclusion]
\`\`\`
  `;
  return surveyPromptText;
}

const SURVEY_CRITIC_PROMPT = ` 
  PHẢN BIỆN PHƯƠNG PHÁP NGHIÊN CỨU - RUBRIC CHI TIẾT:

  1. VALIDITY(HỢP LỆ) - 3 điểm:
  - Thang đo có đo đúng biến không ? (Face Validity)
  - Nguồn gốc có uy tín không ? (Construct Validity)

  2. RELIABILITY(TIN CẬY) - 3 điểm:
  - Câu hỏi có rõ ràng, dễ hiểu ?
    - Có bị dẫn dắt(Leading question) không ?
      - Số lượng items có đủ không(thường >= 3 items / biến) ?

        3. FORMAT & ADAPTATION(2 điểm):
  - Thang đo Likert(1 - 5 hoặc 1 - 7) có thống nhất ?
    - Dịch có chuẩn không ?

      4. DEMOGRAPHICS & SAMPLING(2 điểm):
  - Các biến kiểm soát có phù hợp ?
    - Kích thước mẫu có đủ lớn cho SEM / Regression ?
      - Quy trình lấy mẫu có rõ ràng và khả thi ?

        TỔNG ĐIỂM: .../10

  NẾU < 9 ĐIỂM:
   YÊU CẦU SỬA: Chỉ ra cụ thể item nào cần sửa / xóa / thêm.

    OUTPUT:
   ĐIỂM SỐ: .../10
   LỖI CỤ THỂ:
  1. ...
  2. ...
  `;

// =============================================================================
// STARTUP PROJECT PROMPTS (COMPLETELY SEPARATE FROM RESEARCH)
// =============================================================================

const STARTUP_TOPIC_WRITER_PROMPT = `
NHIỆM VỤ: Đề xuất / Tinh chỉnh Ý tưởng Kinh doanh (Startup Idea).
Bạn là Chuyên gia Khởi nghiệp (Startup Mentor).

YÊU CẦU:
1. Xác định vấn đề cốt lõi (Core Problem).
2. Đề xuất giải pháp đột phá.
3. Xác định phân khúc khách hàng mục tiêu sớm (Early Adopters).
4. Đặt tên Startup ấn tượng.
`;

const STARTUP_TOPIC_CRITIC_PROMPT = `
Bạn là Nhà đầu tư mạo hiểm (VC) hoặc Shark. Đánh giá ý tưởng Startup.
Tiêu chí:
1. Độ lớn của vấn đề: Có đáng để giải quyết không?
2. Khả năng mở rộng (Scalability).
3. Rào cản cạnh tranh (Moat).
`;

const STARTUP_MODEL_WRITER_PROMPT = `
NHIỆM VỤ: Xây dựng LEAN CANVAS cho Startup.
Hãy trình bày theo 9 ô của Lean Canvas:
1. Problem
2. Solution
3. Unique Value Proposition (USP)
4. Unfair Advantage
5. Customer Segments
6. Key Metrics
7. Channels
8. Cost Structure
9. Revenue Streams
`;

const STARTUP_MODEL_CRITIC_PROMPT = `
Bạn là Chuyên gia Vận hành (COO). Phản biện Lean Canvas.
Tập trung vào tính thực tế của Revenue và Cost.
`;

const STARTUP_GTM_WRITER_PROMPT = `
NHIỆM VỤ: Xây dựng Kế hoạch Ra mắt (Go-To-Market Strategy - GTM).
Nội dung:
1. Chiến lược kênh (Channels).
2. Lộ trình 90 ngày Launching.
3. KOL/Influencer Strategy.
4. Ngân sách dự kiến.
`;

const STARTUP_OUTLINE_WRITER_PROMPT = ` 
  LẬP PITCH DECK(10 SLIDES) + FINANCIAL PLAN cho Nhà Đầu Tư.

  QUAN TRỌNG NHẤT - XUẤT TRƯỚC:
  - SLIDE 6: Unit Economics(CAC, LTV, Payback) - QUYẾT ĐỊNH ĐẦU TƯ
    - SLIDE 9: Competitor Matrix(So sánh 3 đối thủ)
      - SLIDE 10: Exit Strategy & Ask(Chiến lược thoái vốn)
        - SLIDE 11: Financial Projections(Dự báo 3 năm - BẢNG MARKDOWN)

  PHẦN A: PITCH DECK(10 SLIDES)

   SLIDE 1: TITLE
    - Tên startup + Logo(mô tả)
      - Tagline(1 câu tóm tắt giá trị)
      - Thông tin liên hệ

   SLIDE 2: PROBLEM
    - 3 vấn đề chính khách hàng đang gặp
      - Số liệu / thống kê chứng minh vấn đề lớn
        - Quote từ khách hàng tiềm năng(nếu có)

   SLIDE 3: SOLUTION
    - Mô tả sản phẩm / dịch vụ
      - Demo / Screenshots(mô tả giao diện)
      - Tính năng chính(3 - 5 features)

   SLIDE 4: MARKET SIZE
    - TAM(Total Addressable Market)
    - SAM(Serviceable Addressable Market)
    - SOM(Serviceable Obtainable Market)
    - Nguồn: Báo cáo ngành, thống kê

   SLIDE 5: PRODUCT / DEMO
    - Chi tiết sản phẩm
      - User flow chính
        - Screenshots / Mockups(mô tả)

   SLIDE 6: BUSINESS MODEL & UNIT ECONOMICS
    - Cách kiếm tiền(Revenue streams)
      - Chiến lược giá(Pricing strategy)
        - Bảng Unit Economics:
  | Metric | Giá trị | Giải thích |
  | --------| ---------| ------------|
  | CAC | ... | Chi phí marketing / sales có 1 khách |
  | LTV | ... | Doanh thu trọn đời khách hàng mang lại |
  | LTV / CAC | ... | Tỷ lệ sức khỏe doanh nghiệp(Mục tiêu > 3) |
  | Payback | ... | Thời gian hoàn vốn mỗi khách hàng |

    SLIDE 7: TRACTION
      - Số liệu đạt được(Users, Revenue, Growth)
        - Milestones đã hoàn thành
          - Testimonials(nếu có)

   SLIDE 8: TEAM
    - Founders + Background
    - Advisors(nếu có)
    - Tại sao team này sẽ thành công ?

      SLIDE 9: COMPETITION MATRIX(Ma trận Cạnh tranh)
        - Bảng so sánh trực tiếp với 3 đối thủ chính:
  | Tính năng / Đặc điểm | Giải pháp của bạn | Đối thủ A | Đối thủ B | Đối thủ C |
  | ----------------------| -------------------| -----------| -----------| -----------|
  | Giá | ... | ... | ... | ... |
  | Tính năng chính A |  |  |  |  |
  | Tính năng chính B |  |  |  |  |
  | Điểm khác biệt lớn nhất | [USP] | [Weakness] | [Weakness] | [Weakness] |
    - Phân tích rào cản gia nhập(Barriers to entry).

      SLIDE 10: EXIT STRATEGY & ASK
        - Chiến lược thoái vốn(Exit Strategy): IPO, M & A(đối thủ / đối tác tiềm năng mua lại)
          - Thời gian dự kiến thoái vốn(Exit Timeline): [VD: 5 - 7 năm]
            - Số tiền cần gọi(Investment Ask)
              - Mục đích sử dụng vốn(Use of funds)
                - Milestones sau khi nhận vốn
                  - Thông tin liên hệ

  PHẦN B: FINANCIAL PLAN(BẮT BUỘC BẢNG MARKDOWN)

   SLIDE 11: FINANCIAL PROJECTIONS(Dự báo Tài chính)

  11.1 DỰ BÁO TÀI CHÍNH 3 NĂM(BẮT BUỘC FORMAT NÀY):
  | Năm | Doanh thu | Chi phí | Lợi nhuận | Tăng trưởng |
  | -----| -----------| ---------| -----------| -------------|
  | Năm 1(Y1) | ... | ... | ... | - |
  | Năm 2(Y2) | ... | ... | ... | ...% |
  | Năm 3(Y3) | ... | ... | ... | ...% |

    11.2 CƠ CẤU CHI PHÍ(Cost Structure):
  - Chi phí cố định: Văn phòng, Lương core team, Phần mềm...
  - Chi phí biến đổi: Marketing, Server, Commission...
  - Chi phí một lần: Phát triển MVP, Thiết kế, Pháp lý...

  11.3 UNIT ECONOMICS:
  - CAC(Customer Acquisition Cost): Chi phí có 1 khách hàng
    - LTV(Lifetime Value): Giá trị vòng đời khách hàng
      - LTV / CAC Ratio: Phải > 3x để bền vững
        - Payback Period: Thời gian hoàn vốn mỗi khách

  11.4 BREAK - EVEN ANALYSIS(Phân tích Điểm hòa vốn):
  - Doanh thu hòa vốn(Break - even Revenue): $...
  - Số khách hàng cần đạt để hòa vốn(Break - even Units): ...khách
    - Thời điểm hòa vốn dự kiến: Tháng thứ ... kể từ khi ra mắt
      - Runway(Thời gian sống sót với số vốn hiện tại): ...tháng

   SLIDE 12: FUNDING & USE OF FUNDS(Vốn & Sử dụng vốn)

  12.1 LỊCH SỬ GỌI VỐN(nếu có):
  | Vòng | Thời gian | Số tiền | Nhà đầu tư | Valuation |
  | ------| -----------| ---------| ------------| -----------|

    12.2 VỐN CẦN GỌI LẦN NÀY:
  - Số tiền: [X VND / USD]
    - Valuation kỳ vọng: [Pre - money / Post - money]
      - Loại hình: Equity / Convertible Note / SAFE

  12.3 SỬ DỤNG VỐN(Use of Funds):
  | Hạng mục | % | Số tiền | Chi tiết |
  | ----------| ---| ---------| ----------|
  | Product Development | 40 % | ... | Thuê dev, server, tools |
  | Marketing & Sales | 30 % | ... | Paid ads, content, events |
  | Operations | 20 % | ... | Văn phòng, pháp lý, HR |
  | Reserve | 10 % | ... | Dự phòng chi phí |

    LƯU Ý: Các phần GTM Strategy(Slide 13 - 15) sẽ được xử lý chi tiết ở Bước GTM riêng.

      SLIDE 13: GO - TO - MARKET STRATEGY(Chiến lược ra thị trường)

  13.1 GIAI ĐOẠN LAUNCHING(3 tháng đầu):

   THÁNG 1 - PRE - LAUNCH:
  - Xây dựng landing page + waitlist
    - Content marketing(Blog, Social)
      - Influencer seeding(5 - 10 KOLs)
        - PR: Bài viết trên báo công nghệ / khởi nghiệp
          - Target: 1,000 email đăng ký

   THÁNG 2 - SOFT LAUNCH:
  - Beta testing với 100 early adopters
    - Thu thập feedback, fix bugs
      - Case studies từ beta users
        - Referral program cho early users
          - Target: 500 active users

   THÁNG 3 - HARD LAUNCH:
  - Official launch event(online / offline)
    - Paid advertising(Facebook, Google, TikTok)
      - PR campaign lớn
        - Partnership announcements
          - Target: 2,000 paying customers

  13.2 KÊNH MARKETING(Channels):
  | Kênh | Ngân sách | CAC dự kiến | Mục tiêu |
  | ------| -----------| -------------| ----------|
  | Facebook / Instagram Ads | 30 % | X VND | Awareness + Acquisition |
  | Google Ads | 20 % | Y VND | Intent - based acquisition |
  | Content Marketing | 15 % | Z VND | SEO + Organic |
  | Influencer / KOL | 20 % | W VND | Trust + Reach |
  | Referral Program | 10 % | V VND | Viral growth |

    PHẦN 2: LỘ TRÌNH RA MẮT(LAUNCH ROADMAP - 90 NGÀY)
      - Giai đoạn 1: Pre - launch(Build waitlist, seeding).
  - Giai đoạn 2: Soft launch(Beta test, thu thập feedback).
  - Giai đoạn 3: Hard launch(Bùng nổ truyền thông, ads).
  - KPIs cụ thể cho từng giai đoạn.

    PHẦN 3: CHIẾN LƯỢC KOL / INFLUENCER(INFLUENCER STRATEGY)
      - Tiêu chí chọn KOL(Nano, Micro hay Macro).
  - Danh sách 5 - 10 KOLs tiềm năng(mô tả đặc điểm).
  - Chiến dịch hợp tác(Review, Challenge, Livestream).

    PHẦN 4: NGÂN SÁCH & QUẢN TRỊ(BUDGET & OPS)
      - Phân bổ ngân sách chi tiết(Ads, Creative, KOL).
  - Các chỉ số cần theo dõi(CAC, ROAS, Engagement Rate).
  - Kế hoạch dự phòng nếu không đạt mục tiêu.

  YÊU CẦU ĐẦU RA:
  - Sử dụng bảng(Markdown Table) để trình bày lộ trình và ngân sách.
  - Sử dụng Bullet points để mô tả chi tiết các hoạt động.
  - Văn phong năng động, thực chiến nhưng vẫn chuyên nghiệp.
  `;

const STARTUP_GTM_CRITIC_PROMPT = ` 
  PHẢN BIỆN CHIẾN LƯỢC GTM - RUBRIC CHI TIẾT(KHẮT KHE):

  1. TÍNH KHẢ THI(FEASIBILITY) - 3 điểm:
  - Ngân sách có phù hợp với quy mô startup không ?
    - Kênh tiếp cận có đúng nơi khách hàng mục tiêu hiện diện không ?
      - Lộ trình 90 ngày có quá tham vọng hay quá chậm không ?

        2. TÍNH SÁNG TẠO & THU HÚT(CREATIVITY) - 3 điểm:
  - Hook / Headline có đủ hấp dẫn để viral không ?
    - Chiến lược KOL có đặc sắc không hay chỉ là thuê đơn thuần ?

      3. SỰ THỐNG NHẤT(COHESION) - 2 điểm:
  - Chiến lược GTM có nhất quán với giá trị cốt lõi(USP) của sản phẩm không ?

    4. ĐO LƯỜNG(MEASURABILITY) - 2 điểm:
  - Các KPIs có rõ ràng và có thể đo lường được không ?

    TỔNG ĐIỂM: .../10

  NẾU < 9 ĐIỂM:
  REJECT - Chỉ ra lỗ hổng trong chiến lược thực thi.

  OUTPUT FORM:
   ĐIỂM SỐ: .../10
   Điểm yếu chí mạng: [Vấn đề]
   Đề xuất thực chiến: [Cách sửa cụ thể]
    `;

const STARTUP_OUTLINE_CRITIC_PROMPT = ` 
  PHẢN BIỆN PITCH DECK - RUBRIC CHI TIẾT(BẮT BUỘC CHẤM ĐIỂM):

  1. STORY & FLOW(3 điểm):
  - Mạch truyện có hấp dẫn không ?
    - Từ Problem -> Solution -> Ask có logic không ?
      - Có "hook" ngay từ slide đầu không ?

        2. DATA & TRACTION(3 điểm):
  - Số liệu thị trường có nguồn không ?
    - Traction có ấn tượng không ?
      - Unit Economics có hợp lý không ?

        3. TEAM & CREDIBILITY(2 điểm):
  - Team có đủ năng lực không ?
    - Có unfair advantage từ background không ?

      4. ASK & EXIT STRATEGY(2 điểm):
  - Số tiền xin có hợp lý với milestones ?
    - Exit strategy có thực tế không ? (Có đối thủ nào đủ lớn để mua lại không ?)
  - Break - even analysis có dựa trên dữ liệu tài chính ở Slide 11 không ?

    TỔNG ĐIỂM: .../10

  NẾU < 9 ĐIỂM:
  REJECT - Yêu cầu sửa slide cụ thể.

  LƯU Ý:
  - Nếu thiếu slide nào trong 10 slides -> Trừ 1 điểm / slide.
  - Nếu không có số liệu Market Size -> Trừ 2 điểm.

  OUTPUT FORM:
   ĐIỂM SỐ: .../10
    - Story: .../3
      - Data: .../3
        - Team: .../2
          - Ask: .../2

   SLIDES CẦN SỬA:
  ...

   YÊU CẦU CẢI THIỆN:
  ...
  `;

const STARTUP_SURVEY_WRITER_PROMPT = ` 
  NHIỆM VỤ: Thiết kế Bảng Khảo Sát CUSTOMER DISCOVERY(Khám Phá Khách Hàng).

  BỐI CẢNH: Dựa trên ý tưởng và Lean Canvas đã xây dựng, thiết kế bảng khảo sát để validate giả định với khách hàng thực tế.

  PHƯƠNG PHÁP: THE MOM TEST(BẮT BUỘC)
    - KHÔNG hỏi ý kiến -> Hỏi về HÀNH VI trong quá khứ
      - KHÔNG dẫn dắt câu trả lời -> Để khách hàng tự nói
        - KHÔNG pitch sản phẩm -> Chỉ lắng nghe vấn đề

  CẤU TRÚC BẢNG KHẢO SÁT:

   PHẦN 1: NHÂN KHẨU HỌC(DEMOGRAPHICS)
    - Độ tuổi, Giới tính, Nghề nghiệp
      - Thu nhập(nếu relevant)
        - Khu vực sinh sống / làm việc

   PHẦN 2: XÁC NHẬN VẤN ĐỀ(PROBLEM VALIDATION)
  VÍ DỤ CÂU HỎI TỐT(Mom Test):
  - "Lần cuối bạn gặp vấn đề [X] là khi nào?"
    - "Bạn đã làm gì để giải quyết?"
    - "Điều gì khiến bạn khó chịu nhất về [Y]?"

  VÍ DỤ CÂU HỎI TỆ(TRÁNH):
  - "Bạn có thấy [sản phẩm của tôi] hữu ích không?"
    - "Bạn có muốn dùng app này không?" 

   PHẦN 3: GIẢI PHÁP HIỆN TẠI(CURRENT SOLUTIONS)
    - Hiện tại bạn đang dùng gì để giải quyết vấn đề này ?
      - Chi phí bạn đang bỏ ra là bao nhiêu ?
        - Điểm gì khiến bạn không hài lòng với giải pháp hiện tại ?

          PHẦN 4: SẴN SÀNG CHI TRẢ(WILLINGNESS TO PAY)
            - "Nếu có giải pháp giải quyết [vấn đề], bạn sẵn sàng chi bao nhiêu?"
            - Tần suất sử dụng dự kiến
              - Yếu tố quyết định mua hàng

   PHẦN 5: ƯU TIÊN TÍNH NĂNG(FEATURE PRIORITIZATION)
    - Liệt kê 5 - 7 tính năng tiềm năng
      - Yêu cầu xếp hạng theo mức độ quan trọng(1 - 5)
        - Hỏi thêm tính năng nào còn thiếu

  YÊU CẦU OUTPUT(MARKDOWN TABLE):

  | Phần | Câu hỏi | Loại | Mục đích |
  | ------| ---------| ------| ----------|
  | 1 | Bạn thuộc độ tuổi nào ? | Multiple Choice | Demographics |
  | 2 | Lần cuối bạn bỏ bữa trưa là khi nào ? | Open - ended | Problem Validation |
  | ... | ... | ... | ... |

    PHƯƠNG ÁN THU THẬP DỮ LIỆU:
  1. Phỏng vấn sâu(In - depth Interview): 10 - 20 người, 30 - 45 phút / người
  2. Khảo sát online(Google Forms): 100 - 200 responses
  3. Landing Page Test: Đo lường conversion rate

  SAMPLE SIZE & VALIDATION:
  - Minimum: 30 responses để có statistical significance
    - Target: 100 + responses cho quantitative insights
      `;

const STARTUP_SURVEY_CRITIC_PROMPT = ` 
  PHẢN BIỆN BẢNG KHẢO SÁT CUSTOMER DISCOVERY - RUBRIC CHI TIẾT:

  1. MOM TEST COMPLIANCE(3 điểm):
  - Câu hỏi có tránh dẫn dắt không ?
    - Có hỏi về hành vi quá khứ thay vì ý kiến ?
      - Có tránh pitch sản phẩm trong câu hỏi ?

        2. PROBLEM VALIDATION DEPTH(3 điểm):
  - Câu hỏi có đào sâu vào pain points ?
    - Có hỏi về giải pháp hiện tại ?
      - Có đo lường frequency / severity của vấn đề ?

        3. WILLINGNESS TO PAY(2 điểm):
  - Có câu hỏi về ngân sách không ?
    - Có đo conversion intent không ?

      4. FORMAT & STRUCTURE(2 điểm):
  - Bảng hỏi có đủ các phần cần thiết ?
    - Số lượng câu hỏi có hợp lý ? (15 - 25 câu)

  TỔNG ĐIỂM: .../10

  NẾU < 9 ĐIỂM:
   YÊU CẦU SỬA: Chỉ ra cụ thể câu hỏi nào cần sửa / xóa / thêm.

  LƯU Ý ĐẶC BIỆT:
  - Nếu có câu hỏi dẫn dắt(leading question) -> Trừ 1 điểm / câu
    - Nếu thiếu phần Willingness to Pay -> Trừ 2 điểm

  OUTPUT:
   ĐIỂM SỐ: .../10
   CÂU HỎI CẦN SỬA:
  1. Câu X: [Vấn đề] -> [Gợi ý sửa]
  2. ...

   CÂU HỎI NÊN THÊM:
  ...
  `;

export class AgentSession {
  private messages: AgentMessage[] = [];
  public finalizedTopic?: string;
  public finalizedModel?: string;
  public finalizedModelChart?: string;
  public finalizedOutline?: string;
  public finalizedOutlineChart?: string;
  public finalizedGTM?: string;
  public finalizedSurvey?: string;
  private sessionId: string;
  private userId?: string;
  private contextSummary?: string;  // NEW: AI-generated summary of key decisions
  private static CONTEXT_SUMMARY_THRESHOLD = 30; // Trigger summary after this many messages

  constructor(
    public topic: string,
    public goal: string = "NghiÃªn cá»©u khoa há»c",
    public audience: string = "ChuyÃªn gia/NhÃ  nghiÃªn cá»©u",
    public level: AcademicLevel = "MASTER",
    public language: 'vi' | 'en' = 'vi',
    public projectType: ProjectType = 'RESEARCH', // NEW: Support startup projects
    private writerKey?: string,
    private criticKey?: string,
    sessionId?: string,
    userId?: string
  ) {
    this.sessionId = sessionId || `session_${Date.now()} `;
    this.userId = userId;
  }

  public updateTopic(newTopic: string) {
    this.topic = newTopic;
    this.finalizedTopic = newTopic;
  }

  public setFinalizedTopic(topic: string) {
    this.finalizedTopic = topic;
  }

  public setFinalizedModel(model: string, chart?: string) {
    this.finalizedModel = model;
    this.finalizedModelChart = chart;
  }

  public setFinalizedOutline(outline: string, chart?: string) {
    this.finalizedOutline = outline;
    this.finalizedOutlineChart = chart;
  }

  public setFinalizedGTM(gtm: string) {
    this.finalizedGTM = gtm;
  }

  public setFinalizedSurvey(survey: string) {
    this.finalizedSurvey = survey;
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public getContextSummary(): string | undefined {
    return this.contextSummary;
  }

  public setContextSummary(summary: string): void {
    this.contextSummary = summary;
  }

  // Generate a summary of key decisions when conversation gets too long
  public async generateContextSummary(): Promise<string | null> {
    if (this.messages.length < AgentSession.CONTEXT_SUMMARY_THRESHOLD) {
      return null; // Not enough messages to summarize
    }

    const summaryPrompt = `
  Báº¡n lÃ  trá»£ lÃ½ tÃ³m táº¯t há»™i thoáº¡i.Hãy tÃ³m táº¯t cÃ¡c ÄIá»‚M ÄÃƒ CHá»T sau tá»« cuá»™c há»™i thoáº¡i:

  Äá» tÃ i: ${this.topic}
  Loáº¡i dá»± Ã¡n: ${this.projectType}

${this.finalizedTopic ? `âœ… Ã tÆ°á»Ÿng/Äá» tÃ i Ä‘Ã£ chá»‘t: ${this.finalizedTopic}` : ''}
${this.finalizedModel ? `âœ… MÃ´ hÃ¬nh Ä‘Ã£ chá»‘t: ${this.finalizedModel.substring(0, 500)}...` : ''}
${this.finalizedOutline ? `âœ… Äá» cÆ°Æ¡ng Ä‘Ã£ chá»‘t: ${this.finalizedOutline.substring(0, 500)}...` : ''}
${this.finalizedGTM ? `âœ… GTM Ä‘Ã£ chá»‘t: ${this.finalizedGTM.substring(0, 500)}...` : ''}

YÃŠU Cáº¦U: TÃ³m táº¯t trong 5 - 7 bullet points ngáº¯n gá»n.Táº­p trung vÃ o cÃ¡c quyáº¿t Ä‘á»‹nh quan trá»ng vÃ  hÆ°á»›ng Ä‘i Ä‘Ã£ thá»‘ng nháº¥t.
    `;

    try {
      const summary = await this.callGeminiAPI(AgentSession.PRIMARY_MODEL, summaryPrompt);
      this.contextSummary = summary;
      return summary;
    } catch (e) {
      console.error('Failed to generate context summary:', e);
      return null;
    }
  }

  public isUsingSameKey(): boolean {
    // Check if Writer and Critic are using the same API key
    return this.writerKey === this.criticKey || (!this.criticKey && !!this.writerKey);
  }

  // Primary and fallback models
  private static PRIMARY_MODEL = 'gemini-3-flash-preview';
  private static FALLBACK_MODEL = 'gemini-flash-latest';

  private async callGeminiAPI(model: string, prompt: string, customKey?: string, retries = 3, useFallback = false): Promise<string> {
    const currentModel = useFallback ? AgentSession.FALLBACK_MODEL : model;

    try {
      // Call server-side proxy instead of direct API
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // If custom key provided, add it to headers
      if (customKey) {
        headers['x-gemini-api-key'] = customKey;
      }

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: currentModel,
          prompt,
          useCustomKey: !!customKey
        })
      });

      const data = await response.json();

      // Handle errors from proxy
      if (!response.ok) {
        const errorMsg = data.error || 'Unknown error';

        console.error(`ðŸš¨ Gemini Proxy Error: `, {
          model: currentModel,
          status: response.status,
          message: errorMsg,
          retriesLeft: retries,
          useFallback
        });

        // Handle Rate Limit (429)
        if (response.status === 429) {
          // If still on primary model and has retries, retry with delay
          if (retries > 0 && !useFallback) {
            const waitTime = 10000 * (4 - retries); // 10s, 20s, 30s
            console.warn(`âš ï¸ Rate Limit on ${currentModel}.Retrying in ${waitTime / 1000}s... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.callGeminiAPI(model, prompt, customKey, retries - 1, false);
          }

          // If primary exhausted, try fallback model
          if (!useFallback) {
            console.warn(`ðŸ”„ Switching to fallback model: ${AgentSession.FALLBACK_MODEL} `);
            return this.callGeminiAPI(model, prompt, customKey, 2, true);
          }

          // Both models failed
          throw new Error(`Cáº£ hai model Ä‘á»u háº¿t quota.Vui lòng thá»­ láº¡i sau hoáº·c dÃ¹ng API Key riÃªng.`);
        }

        // Unauthorized (need login)
        if (response.status === 401) {
          throw new Error(`Vui lòng Ä‘Äƒng nhập Ä‘á»ƒ sá»­ dá»¥ng tÃ­nh nÄƒng AI.`);
        }

        // Other errors
        throw new Error(errorMsg);
      }

      if (useFallback) {
        console.log(`âœ… Fallback model ${currentModel} succeeded!`);
      }

      return data.text || "Lá»—i: KhÃ´ng cÃ³ pháº£n há»“i tá»« AI.";

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      // Network errors -> Retry
      if (retries > 0 && (error.message?.includes('fetch') || error.message?.includes('network'))) {
        console.warn(`Network error, retrying... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        return this.callGeminiAPI(model, prompt, customKey, retries - 1, useFallback);
      }
      throw error;
    }
  }

  async generateWriterTurn(step: WorkflowStep, previousCriticFeedback?: string): Promise<string> {
    try {
      const finalKey = this.writerKey;
      if (!finalKey) {
        return "âš ï¸ CHÆ¯A Cáº¤U HÃŒNH API KEY: Vui lòng vÃ o Cài đặt (âš™ï¸) Ä‘á»ƒ nhập API Key cá»§a báº¡n. Hệ thống không còn dùng key mặc định.";
      }

      let sysPrompt = "";
      let contextAddition = "";

      // Add context summary if available (for long conversations)
      if (this.contextSummary) {
        contextAddition += `\n\nðŸ“Œ TÃ“M Táº®T CÃC ÄIá»‚M ÄÃƒ CHá»T: \n${this.contextSummary} \n\n`;
      }

      // Choose prompts based on project type
      if (this.projectType === 'STARTUP') {
        // STARTUP PROJECT PROMPTS
        switch (step) {
          case '1_TOPIC':
            sysPrompt = STARTUP_TOPIC_WRITER_PROMPT;
            break;
          case '2_MODEL':
            sysPrompt = STARTUP_MODEL_WRITER_PROMPT;
            if (this.finalizedTopic) {
              contextAddition = `\n\nÃ TÆ¯á»žNG KINH DOANH ÄÃƒ PHÃŠ DUYá»†T: \n"${this.finalizedTopic}"`;
            }
            break;
          case '3_OUTLINE':
            sysPrompt = STARTUP_OUTLINE_WRITER_PROMPT;
            if (this.finalizedTopic) {
              contextAddition += `\n\nÃ TÆ¯á»žNG KINH DOANH: \n"${this.finalizedTopic}"`;
            }
            if (this.finalizedModel) {
              contextAddition += `\n\nLEAN CANVAS ÄÃƒ PHÃŠ DUYá»†T: \n${this.finalizedModel.substring(0, 1500)}...`;
            }
            if (this.finalizedModelChart) {
              contextAddition += `\n\nSÆ  Äá»’ BUSINESS MODEL: \n\`\`\`mermaid\n${this.finalizedModelChart}\n\`\`\``;
            }
            break;
          case '5_GTM':
            sysPrompt = STARTUP_GTM_WRITER_PROMPT;
            if (this.finalizedTopic) {
              contextAddition += `\n\nÃ TÆ¯á»žNG: "${this.finalizedTopic}"`;
            }
            if (this.finalizedModel) {
              contextAddition += `\n\nLEAN CANVAS: ${this.finalizedModel.substring(0, 500)}...`;
            }
            if (this.finalizedOutline) {
              contextAddition += `\n\nPITCH DECK: ${this.finalizedOutline.substring(0, 1000)}...`;
            }
            break;
          case '4_SURVEY':
            sysPrompt = STARTUP_SURVEY_WRITER_PROMPT;
            if (this.finalizedTopic) {
              contextAddition += `\n\nÃ TÆ¯á»žNG: "${this.finalizedTopic}"`;
            }
            if (this.finalizedModel) {
              contextAddition += `\n\nLEAN CANVAS: ${this.finalizedModel.substring(0, 500)}...`;
            }
            if (this.finalizedOutline) {
              contextAddition += `\n\nPITCH DECK: ${this.finalizedOutline.substring(0, 500)}...`;
            }
            if (this.finalizedGTM) {
              contextAddition += `\n\nCHIẾN LƯỢC GTM: ${this.finalizedGTM.substring(0, 500)}...`;
            }
            break;
        }
      } else {
        // RESEARCH PROJECT PROMPTS (existing logic)
        switch (step) {
          case '1_TOPIC':
            sysPrompt = TOPIC_WRITER_PROMPT;
            break;
          case '1_LIT_REVIEW':
            sysPrompt = LIT_REVIEW_WRITER_PROMPT;
            if (this.finalizedTopic) {
              contextAddition += `\n\nĐỀ TÀI CHÍNH THỨC: "${this.finalizedTopic}"`;
            }
            break;
          case '2_MODEL':
            sysPrompt = getModelWriterPrompt(this.level);
            if (this.finalizedTopic) {
              contextAddition = `\n\nÄá»€ TÃ€I ÄÃƒ ÄÆ¯á»¢C PHÃŠ DUYá»†T (sá»­ dá»¥ng lÃ m ná»n táº£ng):\n"${this.finalizedTopic}"`;
            }
            break;
          case '3_OUTLINE':
            sysPrompt = getOutlineWriterPrompt(this.goal);
            if (this.finalizedTopic) {
              contextAddition += `\n\nÄá»€ TÃ€I ÄÃƒ PHÃŠ DUYá»†T:\n"${this.finalizedTopic}"`;
            }
            if (this.finalizedModel) {
              contextAddition += `\n\nMÃ” HÃŒNH LÃ THUYáº¾T ÄÃƒ PHÃŠ DUYá»†T:\n${this.finalizedModel.substring(0, 1000)}...`;
            }
            if (this.finalizedModelChart) {
              contextAddition += `\n\nSÆ  Äá»’ MÃ” HÃŒNH:\n\`\`\`mermaid\n${this.finalizedModelChart}\n\`\`\``;
            }
            break;
          case '2_ARCH':
            sysPrompt = SOFTWARE_ARCH_WRITER_PROMPT;
            if (this.finalizedTopic) contextAddition = `\n\nĐỀ TÀI: "${this.finalizedTopic}"`;
            break;
          case '4_BENCHMARK':
            sysPrompt = SOFTWARE_BENCHMARK_WRITER_PROMPT;
            if (this.finalizedTopic) contextAddition += `\n\nĐỀ TÀI: "${this.finalizedTopic}"`;
            if (this.finalizedModel) contextAddition += `\n\nKIẾN TRÚC: ${this.finalizedModel.substring(0, 500)}...`;
            break;
          case '4_SURVEY':
            sysPrompt = getSurveyPrompt(this.level);
            if (this.finalizedTopic) {
              contextAddition += `\n\nÄá»€ TÃ€I: "${this.finalizedTopic}"`;
            }
            if (this.finalizedModel) {
              contextAddition += `\n\nMÔ HÌNH: ${this.finalizedModel.substring(0, 500)}...`;
            }
            if (this.finalizedOutline) {
              contextAddition += `\n\nÄá»€ CÆ¯Æ NG (trÃ­ch Ä‘oáº¡n): ${this.finalizedOutline.substring(0, 500)}...`;
            }
            break;
        }
      }

      const context = `CHá»¦ Äá»€ Gá»C: ${this.topic}\nLOáº I HÃŒNH (OUTPUT): ${this.goal}\nÄá»I TÆ¯á»¢NG: ${this.audience}\nTRÃŒNH Äá»˜: ${this.level}\nNGÃ”N NGá»® Äáº¦U RA (OUTPUT LANGUAGE): ${this.language === 'en' ? 'ENGLISH (100%)' : 'VIETNAMESE (100%)'}${contextAddition}`;

      const prompt = previousCriticFeedback
        ? `${context}\n\nPHẢN HỒI CỦA CRITIC (Vòng trước): ${previousCriticFeedback}\n\n${sysPrompt}\nHãy cải thiện/viết tiếp dựa trên phản hồi này.`
        : `${context}\n\n${sysPrompt}\nHãy bắt đầu thực hiện nhiệm vụ cho giai đoạn này.`;

      // Use Preferred Model
      return await this.callGeminiAPI('gemini-3-flash-preview', prompt, finalKey);

    } catch (error: any) {
      console.error("Gemini Writer Error:", error);
      return `Lá»—i AI: ${error.message || error}`;
    }
  }

  async generateCriticTurn(step: WorkflowStep, writerDraft: string): Promise<string> {
    // Use Critic Key if available, else fallback to Writer Key
    const geminiKey = this.criticKey || this.writerKey;

    if (!geminiKey) {
      return "âš ï¸ CHÆ¯A Cáº¤U HÃŒNH API KEY: Vui lòng vÃ o Cài đặt (âš™ï¸) Ä‘á»ƒ nhập API Key.";
    }
    try {
      let sysPrompt = "";

      // Choose critic prompts based on project type
      if (this.projectType === 'STARTUP') {
        switch (step) {
          case '1_TOPIC': sysPrompt = STARTUP_TOPIC_CRITIC_PROMPT; break;
          case '2_MODEL': sysPrompt = STARTUP_MODEL_CRITIC_PROMPT; break;
          case '3_OUTLINE': sysPrompt = STARTUP_OUTLINE_CRITIC_PROMPT; break;
          case '4_SURVEY': sysPrompt = STARTUP_SURVEY_CRITIC_PROMPT; break;
          case '5_GTM': sysPrompt = STARTUP_GTM_CRITIC_PROMPT; break;
        }
      } else {
        switch (step) {
          case '1_TOPIC': sysPrompt = TOPIC_CRITIC_PROMPT; break;
          case '1_LIT_REVIEW': sysPrompt = LIT_REVIEW_CRITIC_PROMPT; break;
          case '2_MODEL': sysPrompt = getModelCriticPrompt(this.level); break;
          case '3_OUTLINE': sysPrompt = OUTLINE_CRITIC_PROMPT; break;
          case '4_SURVEY': sysPrompt = SURVEY_CRITIC_PROMPT; break;
          case '2_ARCH': sysPrompt = SOFTWARE_ARCH_CRITIC_PROMPT; break;
          case '4_BENCHMARK': sysPrompt = "Bạn là Reviewer chuyên về Empirical Software Engineering. Hãy đánh giá phương pháp kiểm thử và benchmark vừa đề xuất."; break;
        }
      }

      const prompt = `${sysPrompt}\n\nBÃ€I LÃ€M CỦA WRITER:\n${writerDraft}\n\nHãy Ä‘Ã³ng vai trÃ² Critic vÃ  Ä‘Æ°a ra nháº­n xÃ©t chi tiáº¿t, kháº¯t khe.`;

      // Use Preferred Model
      return await this.callGeminiAPI('gemini-3-flash-preview', prompt, geminiKey);

    } catch (error) {
      return `Lỗi Critic (Quota/Network): ${error}`;
    }
  }
}





