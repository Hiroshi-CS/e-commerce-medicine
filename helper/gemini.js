const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { google } = require("googleapis");
require("dotenv").config();
const stringSimilarity = require("string-similarity");

// Kiểm tra API Key của Gemini
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("Chưa đặt biến môi trường GOOGLE_API_KEY.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Cấu hình model Gemini
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

// Khởi tạo Google Sheets API
const path = require("path");
const keyPath = path.join(__dirname, "../ggsheet-api.json");

const auth = new google.auth.GoogleAuth({
  keyFilename: keyPath, // dùng đúng tên property
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});
const sheets = google.sheets({ version: "v4", auth });

// ID của Google Sheet và phạm vi dữ liệu
const SPREADSHEET_ID = "1Q83rytiRRsSs9PSekSkDGsvdJXn_24o5P3HB3oALCpo";
const RANGE = "Sheet1!A2:B101"; // Giả định cột A (question), cột B (answer), 100 dòng từ A2:B101

// Hàm đọc dữ liệu từ Google Sheet
async function getSheetData() {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });
    const rows = response.data.values || [];

    return rows.map((row) => ({
      question: row[0] || "",
      answer: row[1] || "",
    }));
  } catch (error) {
    console.error("Lỗi khi đọc Google Sheet:", error);
    return [];
  }
}

// Ngữ cảnh nhà thuốc
const PHARMACY_CONTEXT_INSTRUCTIONS = [
  {
    role: "user",
    parts: [
      {
        text: `
                Bạn là một trợ lý ảo của nhà thuốc Medicine.
                Nhiệm vụ của bạn là trả lời các câu hỏi chung về sản phẩm (không phải liều dùng cá nhân),
                thông tin về giờ mở cửa, chính sách giao hàng, và các câu hỏi thường gặp khác về nhà thuốc.
                Tuyệt đối KHÔNG được đưa ra lời khuyên y tế, chẩn đoán, hoặc đề xuất điều trị.
                Nếu người dùng hỏi về tình trạng bệnh cụ thể, liều dùng cá nhân, hoặc tư vấn y tế,
                hãy trả lời rằng bạn không thể cung cấp thông tin đó và khuyên họ nên tham khảo ý kiến bác sĩ hoặc dược sĩ.
                Hãy trả lời một cách thân thiện và chuyên nghiệp.
                Dựa vào dữ liệu từ Google Sheet để trả lời các câu hỏi liên quan đến thông tin y tế chung.
            `,
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: "Tôi đã hiểu. Tôi là trợ lý ảo của nhà thuốc Medicine. Tôi sẽ hỗ trợ trả lời các câu hỏi chung về sản phẩm và nhà thuốc, đồng thời sẽ không đưa ra lời khuyên y tế và luôn nhắc nhở người dùng tham khảo ý kiến chuyên gia.",
      },
    ],
  },
];

/**
 * Gửi tin nhắn đến Gemini và nhận phản hồi.
 * @param {string} userMessage Tin nhắn của người dùng.
 * @param {Array} history Lịch sử chat.
 * @returns {Promise<string>} Phản hồi từ Gemini.
 */
async function sendMessage(userMessage, history = []) {
    try {
      const sheetData = await getSheetData();
      const questions = sheetData.map((entry) => entry.question);
  
      // Tìm câu hỏi giống nhất
      const { bestMatch } = stringSimilarity.findBestMatch(userMessage, questions);
      const matchedQuestion = bestMatch.target;
      const similarityScore = bestMatch.rating;
    
      console.log("Matched:", matchedQuestion, "Score:", similarityScore);
    
      // Nếu độ giống đủ cao, lấy câu trả lời
      const threshold = 0.5; // Ngưỡng bạn có thể tùy chỉnh
      const matchedEntry =
        similarityScore >= threshold
          ? sheetData.find((entry) => entry.question === matchedQuestion)
          : null;
  
      // Nếu tìm thấy câu hỏi khớp trong sheet => trả về luôn
      if (matchedEntry) {
        return matchedEntry.answer;
      }
  
      // Nếu không khớp, mới dùng Gemini
      const chat = model.startChat({
        history: [...PHARMACY_CONTEXT_INSTRUCTIONS, ...history],
      });
  
      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      return await response.text();
    } catch (error) {
    console.error("Lỗi khi gửi tin nhắn đến Gemini:", error);
    if (error.message.includes("SAFETY")) {
      throw new Error(
        "Nội dung không phù hợp hoặc vi phạm chính sách an toàn."
      );
    }
    throw new Error("Không thể nhận phản hồi từ trợ lý AI.");
  }
}

module.exports = { sendMessage };
