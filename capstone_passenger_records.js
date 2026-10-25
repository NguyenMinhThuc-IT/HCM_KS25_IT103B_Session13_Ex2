const passengerRecords = [
  {
    pnrCode: "PNR101",
    passengerName: "Nguyen Van An",
    idNumber: "001092004567", // CCCD 12 chu so hop le
    flightNumber: "VN205",
    seatNumber: "12A",
    isCheckedIn: true
  },
  {
    pnrCode: "PNR102",
    passengerName: "Tran Thi Mai",
    idNumber: "B1234567",     // Ho chieu hop le
    flightNumber: "VJ330",
    seatNumber: "14B",
    isCheckedIn: false
  }
];

let autoPnrCounter = 3;

// 2. CAC HAM KIEM CHUAN (VALIDATOR FUNCTIONS)

// Ham kiem tra dinh dang giay to tuy than (CCCD 12 so hoac Ho chieu bat dau bang 1 chu cai + 7-8 so)
const validateIdentityDocument = (idNumber) => {
  if (!idNumber || typeof idNumber !== "string") {
    return { isValid: false, message: "So giay to tuy than khong hop le." };
  }

  const cleanId = idNumber.trim();

  // Kiem tra CCCD: dung 12 ky tu so
  let isCccd = true;
  if (cleanId.length === 12) {
    for (let i = 0; i < cleanId.length; i++) {
      const code = cleanId.charCodeAt(i);
      if (code < 48 || code > 57) {
        isCccd = false;
        break;
      }
    }
  } else {
    isCccd = false;
  }

  if (isCccd) {
    return { isValid: true, type: "CCCD" };
  }

  // Kiem tra Passport (Ho chieu): Bat dau bang 1 chu cai, theo sau la 7 hoac 8 chu so
  let isPassport = false;
  if (cleanId.length === 8 || cleanId.length === 9) {
    const firstChar = cleanId[0].toUpperCase();
    const isFirstLetter = firstChar >= "A" && firstChar <= "Z";
    
    if (isFirstLetter) {
      let allDigits = true;
      for (let i = 1; i < cleanId.length; i++) {
        const code = cleanId.charCodeAt(i);
        if (code < 48 || code > 57) {
          allDigits = false;
          break;
        }
      }
      isPassport = allDigits;
    }
  }

  if (isPassport) {
    return { isValid: true, type: "PASSPORT" };
  }

  return { isValid: false, message: "Giay to khong hop le (CCCD yeu cau 12 so, Ho chieu gom 1 chu cai + 7-8 so)." };
};

// Ham kiem tra so ghe da bi trung tren cung mot chuyen bay chua
const isSeatTakenOnFlight = (list, flightNumber, seatNumber) => {
  const targetFlight = flightNumber.trim().toUpperCase();
  const targetSeat = seatNumber.trim().toUpperCase();

  for (let i = 0; i < list.length; i++) {
    const record = list[i];
    if (
      record.flightNumber.toUpperCase() === targetFlight &&
      record.seatNumber &&
      record.seatNumber.toUpperCase() === targetSeat &&
      record.isCheckedIn
    ) {
      return true; // Da co nguoi ngoi
    }
  }
  return false;
};

// Ham tim kiem ho so theo ma PNR
const findRecordByPnr = (list, pnrCode) => {
  if (!pnrCode) return null;
  const targetPnr = pnrCode.trim().toUpperCase();
  for (let i = 0; i < list.length; i++) {
    if (list[i].pnrCode.toUpperCase() === targetPnr) {
      return list[i];
    }
  }
  return null;
};

// 3. CAC HAM NGHIỆP VU CRUD & CHECK-IN (BUSINESS LOGIC LAYER)

// CREATE: Tiep nhan ho so hanh khach moi
const createPassengerRecord = (list, passengerData) => {
  if (!passengerData || typeof passengerData !== "object") {
    console.log("[ERROR]: Du lieu ho so khong hop le.");
    return null;
  }

  const { passengerName, idNumber, flightNumber, seatNumber } = passengerData;

  if (!passengerName || passengerName.trim() === "") {
    console.log("[ERROR]: Ten hanh khach khong duoc de rong.");
    return null;
  }

  const idCheck = validateIdentityDocument(idNumber);
  if (!idCheck.isValid) {
    console.log(`[ERROR]: ${idCheck.message}`);
    return null;
  }

  if (!flightNumber || flightNumber.trim() === "") {
    console.log("[ERROR]: So hieu chuyen bay khong duoc de rong.");
    return null;
  }

  const cleanSeat = seatNumber ? seatNumber.trim().toUpperCase() : "";
  if (cleanSeat !== "" && isSeatTakenOnFlight(list, flightNumber, cleanSeat)) {
    console.log(`[ERROR]: So ghe "${cleanSeat}" tren chuyen bay "${flightNumber}" da co hanh khach dat.`);
    return null;
  }

  const generatedPnr = "PNR" + (100 + autoPnrCounter);
  autoPnrCounter++;

  const newRecord = {
    pnrCode: generatedPnr,
    passengerName: passengerName.trim(),
    idNumber: idNumber.trim(),
    flightNumber: flightNumber.trim().toUpperCase(),
    seatNumber: cleanSeat,
    isCheckedIn: cleanSeat !== ""
  };

  list.push(newRecord);
  console.log(`[SUCCESS]: Tiep nhan thanh cong ho so cho "${newRecord.passengerName}" voi ma PNR: ${newRecord.pnrCode}`);
  return newRecord;
};

// READ: Hien thi danh sach toan bo ho so hanh khach dang bang
const listPassengerRecords = (list) => {
  const borderLine = "-".repeat(95);
  console.log("\n" + borderLine);
  console.log("                           DANH SACH HO SO HANH KHACH SAN BAY                           ");
  console.log(borderLine);
  console.log(
    "MA PNR".padEnd(10) +
    "TEN HANH KHACH".padEnd(24) +
    "GIAY TO (ID/PASSPORT)".padEnd(24) +
    "CHUYEN BAY".padEnd(14) +
    "SO GHE".padEnd(10) +
    "TRANG THAI"
  );
  console.log(borderLine);

  if (list.length === 0) {
    console.log("                         KHONG CO HO SO HANH KHACH TRONG HE THONG                        ");
  } else {
    for (let i = 0; i < list.length; i++) {
      const rec = list[i];
      const colPnr = rec.pnrCode.padEnd(10);
      const colName = (rec.passengerName.length > 21 ? rec.passengerName.slice(0, 18) + "..." : rec.passengerName).padEnd(24);
      const colId = rec.idNumber.padEnd(24);
      const colFlight = rec.flightNumber.padEnd(14);
      const colSeat = (rec.seatNumber ? rec.seatNumber : "CHUA CAP").padEnd(10);
      const colStatus = rec.isCheckedIn ? "DA CHECK-IN" : "CHUA CHECK-IN";

      console.log(`${colPnr}${colName}${colId}${colFlight}${colSeat}${colStatus}`);
    }
  }

  console.log(borderLine);
  console.log(`TONG SO HO SO: ${list.length.toString().padStart(8)} hanh khach`);
  console.log(borderLine);
};

// CHECK-IN & SEAT ASSIGNMENT: Thuc hien cap so ghe va hoan tat check-in
const processCheckIn = (list, pnrCode, desiredSeat) => {
  const targetRecord = findRecordByPnr(list, pnrCode);
  if (!targetRecord) {
    console.log(`[ERROR]: Khong tim thay ho so voi ma PNR "${pnrCode}".`);
    return false;
  }

  if (targetRecord.isCheckedIn) {
    console.log(`[INFO]: Hanh khach "${targetRecord.passengerName}" da thuc hien check-in tu truoc (Ghe: ${targetRecord.seatNumber}).`);
    printBoardingPass(targetRecord);
    return true;
  }

  const cleanSeat = desiredSeat ? desiredSeat.trim().toUpperCase() : "";
  if (cleanSeat === "") {
    console.log("[ERROR]: So ghe phai duoc chi dinh de check-in.");
    return false;
  }

  // Kiem tra trung so ghe tren cung chuyen bay
  if (isSeatTakenOnFlight(list, targetRecord.flightNumber, cleanSeat)) {
    console.log(`[ERROR]: Ghe "${cleanSeat}" tren chuyen bay "${targetRecord.flightNumber}" da co nguoi dat. Vui long chon ghe khac.`);
    return false;
  }

  targetRecord.seatNumber = cleanSeat;
  targetRecord.isCheckedIn = true;

  console.log(`[SUCCESS]: Check-in thanh cong cho hanh khach "${targetRecord.passengerName}".`);
  printBoardingPass(targetRecord);
  return true;
};

// EXPORT BOARDING PASS: Xuất thẻ lên tàu bay chuẩn quốc tế đóng khung bằng dấu "=" kèm mã vạch giả lập
const printBoardingPass = (record) => {
  const frameWidth = 64;
  const border = "=".repeat(frameWidth);

  console.log("\n" + border);
  console.log("                  BOARDING PASS - THE LEN TAU BAY                   ");
  console.log(border);
  console.log(`  MA PNR CODE : ${record.pnrCode.padEnd(20)} CHUYEN BAY : ${record.flightNumber}`);
  console.log(`  HANH KHACH  : ${record.passengerName.padEnd(20)} GHI DANH ID: ${record.idNumber}`);
  console.log(`  SO GHE SEAT : ${record.seatNumber.padEnd(20)} TRANG THAI : DA XAC THUC`);
  console.log("-".repeat(frameWidth));
  console.log("  [ BARCODE / QR CODE ] : ||| | |||| || |||||| | || ||||| | ||| ");
  console.log(`  XAC NHAN AN NINH SAN BAY - VUI LONG CO MAN HINH TRUOC CUA GIA   `);
  console.log(border);
};

// SEARCH PASSPORT / PASSENGER: Tra cuu ho so theo ma PNR hoac Ten
const searchPassenger = (list, keyword) => {
  if (!keyword || keyword.trim() === "") {
    console.log("[ERROR]: Tu khoa tra cuu khong duoc de rong.");
    return;
  }

  const cleanKeyword = keyword.trim().toUpperCase();
  const results = [];

  for (let i = 0; i < list.length; i++) {
    const rec = list[i];
    if (
      rec.pnrCode.toUpperCase().includes(cleanKeyword) ||
      rec.passengerName.toUpperCase().includes(cleanKeyword) ||
      rec.idNumber.toUpperCase().includes(cleanKeyword)
    ) {
      results.push(rec);
    }
  }

  if (results.length === 0) {
    console.log(`[INFO]: Khong tim thay ho so phu hop voi tu khoa "${keyword}".`);
  } else {
    listPassengerRecords(results);
  }
};

// 4. KICH BAN KIEM THU TOAN DIEN HE THONG
console.log("================================================");
console.log("KICH BAN 1: HIEN THI DANH SACH HO SO BAN DAU");
console.log("================================================");
listPassengerRecords(passengerRecords);

console.log("\n================================================");
console.log("KICH BAN 2: TIEP NHAN HO SO HANH KHACH MOI (VALIDATOR ID & SEAT)");
console.log("================================================");
// Thu them ho so voi CCCD khong hop le
createPassengerRecord(passengerRecords, {
  passengerName: "Hoang Van C",
  idNumber: "12345", // Sai dinh dang
  flightNumber: "VN205",
  seatNumber: "12B"
});

// Them ho so dung voi Ho chieu hop le
createPassengerRecord(passengerRecords, {
  passengerName: "Pham Thi Duyen",
  idNumber: "C9876543", // Ho chieu hop le
  flightNumber: "VN205",
  seatNumber: ""
});

listPassengerRecords(passengerRecords);

console.log("\n================================================");
console.log("KICH BAN 3: THUC HIEN CHECK-IN VA CAP SO GHE (CHONG TRUNG GHE)");
console.log("================================================");
// Check-in cho ho so PNR102 chua check-in
processCheckIn(passengerRecords, "PNR102", "15C");

// Thu check-in trung ghe 15C da duoc dat tren cung chuyen bay VJ330 (Thuc te PNR102 thuoc VJ330)
// Neu co hanh khach khac co gang lay ghe 15C cho cung chuyen bay VJ330 se bi chan:
createPassengerRecord(passengerRecords, {
  passengerName: "Vu Tuan Kiet",
  idNumber: "001092008888",
  flightNumber: "VJ330",
  seatNumber: "15C" // Trung ghe voi PNR102
});

console.log("\n================================================");
console.log("KICH BAN 4: TRA CUU HO SO THEO TU KHOA");
console.log("================================================");
searchPassenger(passengerRecords, "Tran Thi Mai");