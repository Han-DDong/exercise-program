// 운동 데이터 초기값
const defaultExercises = {
  데드리프트: { lb: 0, kg: 0, date: "" },
  "프론트 스쿼트": { lb: 0, kg: 0, date: "" },
  "백 스쿼트": { lb: 0, kg: 0, date: "" },
  "벤치 프레스": { lb: 0, kg: 0, date: "" },
  "파워 클린": { lb: 0, kg: 0, date: "" },
  "행 클린": { lb: 0, kg: 0, date: "" },
  "스쿼트 클린": { lb: 0, kg: 0, date: "" },
  "클린&저크": { lb: 0, kg: 0, date: "" },
  "파워 스내치": { lb: 0, kg: 0, date: "" },
  "행 스내치": { lb: 0, kg: 0, date: "" },
  "스쿼트 스내치": { lb: 0, kg: 0, date: "" },
};

// 템플릿 데이터 초기값
const defaultTemplates = {};

// 로컬 스토리지에서 데이터 로드
function loadData() {
  const saved = localStorage.getItem("exerciseData");
  return saved ? JSON.parse(saved) : defaultExercises;
}

// 로컬 스토리지에 데이터 저장
function saveData(data) {
  localStorage.setItem("exerciseData", JSON.stringify(data));
}

// 로컬 스토리지에서 템플릿 데이터 로드
function loadTemplates() {
  const saved = localStorage.getItem("templateData");
  return saved ? JSON.parse(saved) : defaultTemplates;
}

// 로컬 스토리지에 템플릿 데이터 저장
function saveTemplates(data) {
  localStorage.setItem("templateData", JSON.stringify(data));
}

// 마지막 선택 운동 불러오기
function loadSelectedExercise() {
  const saved = localStorage.getItem("selectedExercise");
  return saved || "";
}

// 마지막 선택 운동 저장
function saveSelectedExercise(exerciseName) {
  localStorage.setItem("selectedExercise", exerciseName);
}

// 운동 데이터
let exerciseData = loadData();
let templateData = loadTemplates();
let selectedExercise = loadSelectedExercise();
let isEditMode = false;
let isExerciseEditMode = false;

// 무게 반올림 함수들
function roundUp5(weight) {
  return Math.ceil(weight / 5) * 5;
}

function roundDown5(weight) {
  return Math.floor(weight / 5) * 5;
}

function roundNearest5(weight) {
  return Math.round(weight / 5) * 5;
}

// 날짜 형식 변환: "2025.10.20" 또는 "2025.9.6" -> "2025-10-20" 또는 "2025-09-06"
function dateToInputFormat(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split(".");
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1].padStart(2, "0");
    const day = parts[2].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return dateStr.replace(/\./g, "-");
}

// 날짜 형식 변환: "2025-10-20" -> "2025.10.20"
function inputToDateFormat(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const year = parts[0];
    const month = parseInt(parts[1], 10).toString();
    const day = parseInt(parts[2], 10).toString();
    return `${year}.${month}.${day}`;
  }
  return dateStr.replace(/-/g, ".");
}

// 헤더 dropdown 생성 및 업데이트
function generateExerciseCalculatorSelect() {
  const select = document.getElementById("exercise-calculator-select");
  if (!select) return;

  select.innerHTML = "";
  const exercises = Object.keys(exerciseData);

  exercises.forEach((exerciseName) => {
    const option = document.createElement("option");
    option.value = exerciseName;
    option.textContent = exerciseName;
    if (exerciseName === selectedExercise) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  // dropdown change 이벤트 (한 번만 추가)
  if (!select.hasAttribute("data-listener")) {
    select.setAttribute("data-listener", "true");
    select.addEventListener("change", (e) => {
      selectedExercise = e.target.value;
      saveSelectedExercise(selectedExercise);
      generatePercentageTable();
      generateExerciseList();
      generatePercentageFinder();
      generateTemplate();
      updateReverseCalculator();
    });
  }
}

// 퍼센트 테이블 생성
function generatePercentageTable() {
  const tbody = document.getElementById("percentage-table-body");
  const exercise = exerciseData[selectedExercise];
  const baseWeight = exercise ? exercise.lb : 0;

  tbody.innerHTML = "";
  const percentages = [
    130, 120, 115, 110, 105, 100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0,
  ];

  percentages.forEach((percent) => {
    const calculated = (baseWeight * percent) / 100;
    const row = document.createElement("tr");
    if (percent === 100) {
      row.classList.add("highlight-row");
    }

    row.innerHTML = `
      <td>${percent}%</td>
      <td>${Math.round(calculated)}</td>
      <td>${roundUp5(calculated)}</td>
      <td>${roundNearest5(calculated)}</td>
      <td>${roundDown5(calculated)}</td>
    `;
    tbody.appendChild(row);
  });
}

// 운동 목록 테이블 생성
function generateExerciseList() {
  const tbody = document.getElementById("exercise-list-body");
  tbody.innerHTML = "";

  Object.keys(exerciseData).forEach((exerciseName) => {
    const exercise = exerciseData[exerciseName];
    const row = document.createElement("tr");
    if (exerciseName === selectedExercise) {
      row.classList.add("highlight-row");
    }

    if (isExerciseEditMode) {
      row.innerHTML = `
        <td contenteditable="true" data-exercise="${exerciseName}" data-field="name" style="background-color: #fff3cd;">${exerciseName}</td>
        <td contenteditable="true" data-exercise="${exerciseName}" data-field="lb" style="background-color: #fff3cd;">${
        exercise.lb
      }</td>
        <td class="yellow-cell" contenteditable="true" data-exercise="${exerciseName}" data-field="kg" style="background-color: #fff3cd;">${
        exercise.kg
      }</td>
        <td>
          <input type="date" data-exercise="${exerciseName}" data-field="date" value="${dateToInputFormat(
        exercise.date || ""
      )}" style="width: 100%; padding: 4px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
        </td>
        <td>
          <button class="exercise-btn" style="padding: 4px 8px; font-size: 16px; background-color: #d32f2f; white-space: nowrap;" onclick="deleteExerciseRow('${exerciseName}')">삭제</button>
        </td>
      `;
    } else {
      row.innerHTML = `
        <td><button class="exercise-btn" data-exercise="${exerciseName}">${exerciseName}</button></td>
        <td>${exercise.lb}</td>
        <td class="yellow-cell">${exercise.kg}</td>
        <td>${exercise.date || ""}</td>
      `;
    }
    tbody.appendChild(row);
  });

  // 운동 버튼 클릭 이벤트 (편집 모드가 아닐 때만)
  if (!isExerciseEditMode) {
    document.querySelectorAll(".exercise-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (e.target.dataset.exercise) {
          selectedExercise = e.target.dataset.exercise;
          saveSelectedExercise(selectedExercise); // 마지막 선택 운동 저장
          generateExerciseCalculatorSelect();
          generatePercentageTable();
          generateExerciseList();
          generatePercentageFinder();
          generateTemplate();
          updateReverseCalculator();
        }
      });
    });
  }

  // 날짜 입력 이벤트 (편집 모드일 때만)
  if (isExerciseEditMode) {
    document.querySelectorAll('input[type="date"]').forEach((input) => {
      input.addEventListener("change", (e) => {
        const exerciseName = e.target.dataset.exercise;
        const field = e.target.dataset.field;
        let value = e.target.value;
        value = inputToDateFormat(value);

        exerciseData[exerciseName][field] = value;
        saveData(exerciseData);
        generatePercentageTable();
        generateBig3();
        generatePercentageFinder();
        generateTemplate();
      });
    });
  }

  // 1RM 수정 이벤트 (편집 모드일 때만)
  if (isExerciseEditMode) {
    document.querySelectorAll("[contenteditable='true']").forEach((cell) => {
      const handleSave = (e) => {
        const exerciseName = e.target.dataset.exercise;
        const field = e.target.dataset.field;
        let value = e.target.textContent.trim();

        if (field === "name") {
          // 운동 이름 변경
          if (value && value !== exerciseName && !exerciseData[value]) {
            exerciseData[value] = exerciseData[exerciseName];
            delete exerciseData[exerciseName];
            if (selectedExercise === exerciseName) {
              selectedExercise = value;
              saveSelectedExercise(selectedExercise); // 마지막 선택 운동 저장
            }
            saveData(exerciseData);
            generateExerciseCalculatorSelect();
            generatePercentageTable();
            generateExerciseList();
            generateBig3();
            generatePercentageFinder();
            generateTemplate();
          }
        } else if (field === "lb" || field === "kg") {
          value = parseFloat(value) || 0;
          exerciseData[exerciseName][field] = value;
          // lb와 kg 동기화 (1kg = 2.20462lb)
          if (field === "lb") {
            exerciseData[exerciseName].kg = Math.round(value / 2.20462);
            const kgCell = document.querySelector(`[data-exercise="${exerciseName}"][data-field="kg"]`);
            if (kgCell) kgCell.textContent = exerciseData[exerciseName].kg;
          } else if (field === "kg") {
            exerciseData[exerciseName].lb = Math.round(value * 2.20462);
            const lbCell = document.querySelector(`[data-exercise="${exerciseName}"][data-field="lb"]`);
            if (lbCell) lbCell.textContent = exerciseData[exerciseName].lb;
          }
          saveData(exerciseData);
          generatePercentageTable();
          generateBig3();
          generatePercentageFinder();
          generateTemplate();
        } else {
          exerciseData[exerciseName][field] = value;
          saveData(exerciseData);
        }
      };

      cell.addEventListener("blur", handleSave);
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.target.blur();
        }
      });
    });
  }

  // 편집 모드 버튼 이벤트 (한 번만 추가)
  if (!document.getElementById("exercise-edit-btn").hasAttribute("data-listener")) {
    const editBtn = document.getElementById("exercise-edit-btn");
    const addRowBtn = document.getElementById("exercise-add-row-btn");
    const deleteHeader = document.getElementById("exercise-delete-header");

    editBtn.setAttribute("data-listener", "true");
    editBtn.addEventListener("click", () => {
      isExerciseEditMode = !isExerciseEditMode;
      editBtn.textContent = isExerciseEditMode ? "저장" : "수정";
      if (addRowBtn) {
        addRowBtn.style.display = isExerciseEditMode ? "inline-block" : "none";
      }
      if (deleteHeader) {
        deleteHeader.style.display = isExerciseEditMode ? "table-cell" : "none";
      }
      generateExerciseList();
    });

    // 행 추가 버튼 이벤트 (한 번만 추가)
    if (addRowBtn && !addRowBtn.hasAttribute("data-listener")) {
      addRowBtn.setAttribute("data-listener", "true");
      addRowBtn.addEventListener("click", addExerciseRow);
    }
  }
}

// 운동 행 추가
function addExerciseRow() {
  const newExerciseName = `새 운동 ${Object.keys(exerciseData).length + 1}`;
  exerciseData[newExerciseName] = {
    lb: 0,
    kg: 0,
    date: "",
    big3: false,
  };
  saveData(exerciseData);
  generateExerciseList();
  generateBig3();
  generatePercentageFinder();
  generateTemplate();
}

// 운동 행 삭제
function deleteExerciseRow(exerciseName) {
  if (confirm(`정말로 "${exerciseName}" 운동을 삭제하시겠습니까?`)) {
    delete exerciseData[exerciseName];
    if (selectedExercise === exerciseName) {
      const exercises = Object.keys(exerciseData);
      selectedExercise = exercises.length > 0 ? exercises[0] : "";
      saveSelectedExercise(selectedExercise); // 마지막 선택 운동 저장
    }
    saveData(exerciseData);
    generateExerciseCalculatorSelect();
    generatePercentageTable();
    generateExerciseList();
    generateBig3();
    generatePercentageFinder();
    generateTemplate();
  }
}

// 전역 함수로 등록
window.deleteExerciseRow = deleteExerciseRow;

// 3대 측정 테이블 생성
function generateBig3() {
  const tbody = document.getElementById("big3-body");
  const big3Exercises = ["데드리프트", "백 스쿼트", "벤치 프레스"];

  tbody.innerHTML = "";

  let big3Total = 0;

  big3Exercises.forEach((exerciseName) => {
    const exercise = exerciseData[exerciseName];
    const weight = exercise ? exercise.kg : 0;
    big3Total += weight;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${exerciseName}</td>
      <td class="yellow-cell">${weight}</td>
    `;
    tbody.appendChild(row);
  });

  // 총합 행
  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `
    <td>총합</td>
    <td class="yellow-cell">${big3Total}</td>
  `;
  tbody.appendChild(totalRow);
}

// 퍼센트 찾기 테이블 생성
function generatePercentageFinder() {
  const select = document.getElementById("percentage-finder-select");
  select.innerHTML = "";
  const percentages = [
    0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 130,
  ];

  percentages.forEach((percent) => {
    const option = document.createElement("option");
    option.value = percent;
    option.textContent = `${percent}%`;
    select.appendChild(option);
  });

  select.addEventListener("change", updatePercentageFinder);
  updatePercentageFinder();

  // 역산계산기 초기화 (한 번만)
  initReverseCalculator();
}

function updatePercentageFinder() {
  const select = document.getElementById("percentage-finder-select");
  const percent = parseFloat(select.value);
  const exercise = exerciseData[selectedExercise];
  const baseWeight = exercise ? exercise.lb : 0;
  const calculated = (baseWeight * percent) / 100;

  document.getElementById("percent-calc").textContent = Math.round(calculated);
  document.getElementById("percent-ceil").textContent = roundUp5(calculated);
  document.getElementById("percent-round").textContent = roundNearest5(calculated);
  document.getElementById("percent-floor").textContent = roundDown5(calculated);
}

// 역산계산기 업데이트
function updateReverseCalculator() {
  const relativeWeightInput = document.getElementById("reverse-weight-input");
  const percentInput = document.getElementById("reverse-percent-input");

  const percent = parseFloat(percentInput.value) || 0;

  // 퍼센트와 선택된 운동이 있어야 계산
  if (percent === 0) {
    document.getElementById("reverse-my-weight").textContent = "0";
    document.getElementById("reverse-ceil").textContent = "0";
    document.getElementById("reverse-round").textContent = "0";
    document.getElementById("reverse-floor").textContent = "0";
    return;
  }

  // 선택된 운동이 없으면 계산하지 않음
  if (!selectedExercise || !exerciseData[selectedExercise]) {
    document.getElementById("reverse-my-weight").textContent = "0";
    document.getElementById("reverse-ceil").textContent = "0";
    document.getElementById("reverse-round").textContent = "0";
    document.getElementById("reverse-floor").textContent = "0";
    return;
  }

  // 현재 선택된 운동 종목의 1RM 가져오기
  const exercise = exerciseData[selectedExercise];
  const my1RM = exercise ? exercise.lb : 0;

  if (my1RM === 0) {
    document.getElementById("reverse-my-weight").textContent = "0";
    document.getElementById("reverse-ceil").textContent = "0";
    document.getElementById("reverse-round").textContent = "0";
    document.getElementById("reverse-floor").textContent = "0";
    return;
  }

  // 내 무게 계산: 현재 선택된 운동 종목의 1RM의 퍼센트
  // 예: 프론트 스쿼트 1RM이 335이고, 퍼센트가 80%라면, 내 무게 = 335 × 0.8 = 268
  const myWeight = (my1RM * percent) / 100;

  // 계산된 내 무게 표시 (정수 반올림)
  const roundedWeight = Math.round(myWeight);
  document.getElementById("reverse-my-weight").textContent = roundedWeight;

  // 올림, 반올림, 내림 (일반적인 올림/반올림/내림)
  document.getElementById("reverse-ceil").textContent = Math.ceil(myWeight);
  document.getElementById("reverse-round").textContent = roundedWeight;
  document.getElementById("reverse-floor").textContent = Math.floor(myWeight);
}

// 탭 전환 함수
function switchCalculatorTab(tab) {
  const percentageFinderTab = document.getElementById("percentage-finder-tab");
  const reverseCalcTab = document.getElementById("reverse-calc-tab");
  const percentageFinderContent = document.getElementById("percentage-finder-content");
  const reverseCalcContent = document.getElementById("reverse-calc-content");

  if (tab === "percentage") {
    percentageFinderTab.style.background = "rgba(255,255,255,0.3)";
    percentageFinderTab.style.border = "none";
    reverseCalcTab.style.background = "transparent";
    reverseCalcTab.style.border = "2px solid rgba(255,255,255,0.5)";
    percentageFinderContent.style.display = "block";
    reverseCalcContent.style.display = "none";
  } else {
    reverseCalcTab.style.background = "rgba(255,255,255,0.3)";
    reverseCalcTab.style.border = "none";
    percentageFinderTab.style.background = "transparent";
    percentageFinderTab.style.border = "2px solid rgba(255,255,255,0.5)";
    reverseCalcContent.style.display = "block";
    percentageFinderContent.style.display = "none";
  }
}

// 역산계산기 초기화
function initReverseCalculator() {
  const relativeWeightInput = document.getElementById("reverse-weight-input");
  const percentInput = document.getElementById("reverse-percent-input");

  if (!relativeWeightInput || !percentInput) return;

  // 상대 무게 입력 이벤트
  if (!relativeWeightInput.hasAttribute("data-listener")) {
    relativeWeightInput.setAttribute("data-listener", "true");
    relativeWeightInput.addEventListener("input", () => {
      updateReverseCalculator();
    });
  }

  // 퍼센트 입력 이벤트
  if (!percentInput.hasAttribute("data-listener")) {
    percentInput.setAttribute("data-listener", "true");
    percentInput.addEventListener("input", () => {
      updateReverseCalculator();
    });
  }

  // 탭 전환 이벤트 (한 번만 추가)
  const percentageTab = document.getElementById("percentage-finder-tab");
  const reverseTab = document.getElementById("reverse-calc-tab");

  if (percentageTab && !percentageTab.hasAttribute("data-listener")) {
    percentageTab.setAttribute("data-listener", "true");
    percentageTab.addEventListener("click", () => {
      switchCalculatorTab("percentage");
    });
  }

  if (reverseTab && !reverseTab.hasAttribute("data-listener")) {
    reverseTab.setAttribute("data-listener", "true");
    reverseTab.addEventListener("click", () => {
      switchCalculatorTab("reverse");
      updateReverseCalculator();
    });
  }
}

// 템플릿 테이블 생성
function generateTemplate() {
  const exerciseSelect = document.getElementById("template-exercise-select");
  exerciseSelect.innerHTML = "";

  Object.keys(exerciseData).forEach((exerciseName) => {
    const option = document.createElement("option");
    option.value = exerciseName;
    option.textContent = exerciseName;
    if (exerciseName === selectedExercise) {
      option.selected = true;
    }
    exerciseSelect.appendChild(option);
  });

  exerciseSelect.addEventListener("change", (e) => {
    selectedExercise = e.target.value;
    saveSelectedExercise(selectedExercise); // 마지막 선택 운동 저장
    generateExerciseCalculatorSelect();
    generatePercentageTable();
    generateExerciseList();
    generatePercentageFinder();
    generateTemplate();
    updateReverseCalculator();
  });

  const weekSelect = document.getElementById("template-week-select");
  weekSelect.addEventListener("change", generateTemplateTable);

  const categorySelect = document.getElementById("template-category-select");
  categorySelect.addEventListener("change", generateTemplateTable);

  const editBtn = document.getElementById("template-edit-btn");
  const addRowBtn = document.getElementById("template-add-row-btn");

  editBtn.addEventListener("click", () => {
    isEditMode = !isEditMode;
    editBtn.textContent = isEditMode ? "저장" : "수정";
    addRowBtn.style.display = isEditMode ? "inline-block" : "none";
    const deleteHeader = document.getElementById("delete-header");
    if (deleteHeader) {
      deleteHeader.style.display = isEditMode ? "table-cell" : "none";
    }
    generateTemplateTable();
  });

  addRowBtn.addEventListener("click", () => {
    addTemplateRow();
  });

  generateTemplateTable();
}

function generateTemplateTable() {
  const tbody = document.getElementById("template-body");
  const week = document.getElementById("template-week-select").value;
  const categoryFilter = document.getElementById("template-category-select").value;
  const exercise = exerciseData[selectedExercise];
  const baseWeight = exercise ? exercise.lb : 0;

  // 템플릿 데이터 가져오기
  if (!templateData[selectedExercise]) {
    templateData[selectedExercise] = { 1: [] };
  }

  let currentTemplates = [];

  // 주차 필터링
  if (week === "all") {
    // 전체 주차의 템플릿을 합치기
    [1, 2, 3, 4].forEach((w) => {
      if (!templateData[selectedExercise][w]) {
        templateData[selectedExercise][w] = [];
      }
      const weekTemplates = templateData[selectedExercise][w].map((item, idx) => ({
        ...item,
        week: w,
        originalIndex: idx, // 원래 주차별 인덱스 저장
      }));
      currentTemplates = currentTemplates.concat(weekTemplates);
    });
  } else {
    if (!templateData[selectedExercise][week]) {
      templateData[selectedExercise][week] = [];
    }
    currentTemplates = templateData[selectedExercise][week].map((item, idx) => ({
      ...item,
      week: parseInt(week),
      originalIndex: idx, // 원래 주차별 인덱스 저장
    }));
  }

  // 운동 구분 필터링
  if (categoryFilter !== "all") {
    currentTemplates = currentTemplates.filter((item) => {
      const category = item.category || "Sub";
      return category === categoryFilter;
    });
  }

  tbody.innerHTML = "";

  if (currentTemplates.length === 0) {
    const emptyRow = document.createElement("tr");
    const colspan = isEditMode ? 11 : 10;
    emptyRow.innerHTML = `
      <td colspan="${colspan}" style="text-align: center; padding: 20px;">
        ${
          isEditMode
            ? "행 추가 버튼을 클릭하여 템플릿을 추가하세요."
            : "템플릿이 없습니다. 수정 모드를 활성화하여 추가하세요."
        }
      </td>
    `;
    tbody.appendChild(emptyRow);
    return;
  }

  currentTemplates.forEach((item, index) => {
    const calculated = (baseWeight * item.percent) / 100;
    const row = document.createElement("tr");
    row.dataset.index = item.originalIndex !== undefined ? item.originalIndex : index;
    row.dataset.week = item.week || week;
    const itemWeek = item.week || week;
    const originalIndex = item.originalIndex !== undefined ? item.originalIndex : index;

    if (isEditMode) {
      const categoryValue = item.category || "Sub";
      row.innerHTML = `
        <td>${selectedExercise}</td>
        <td>${itemWeek}주차</td>
        <td>
        <select class="dropdown" data-field="category" data-index="${originalIndex}" data-week="${itemWeek}" style="width: 100%; padding: 4px; background-color: #fff3cd;">
          <option value="Main" ${categoryValue === "Main" ? "selected" : ""}>Main</option>
          <option value="Sub" ${categoryValue === "Sub" ? "selected" : ""}>Sub</option>
        </select>
        </td>
        <td contenteditable="true" data-field="percent" data-week="${itemWeek}" data-original-index="${originalIndex}" style="background-color: #fff3cd;">${
        item.percent
      }</td>
        <td contenteditable="true" data-field="rep" data-week="${itemWeek}" data-original-index="${originalIndex}" style="background-color: #fff3cd;">${
        item.rep
      }</td>
        <td contenteditable="true" data-field="round" data-week="${itemWeek}" data-original-index="${originalIndex}" style="background-color: #fff3cd;">${
        item.round
      }</td>
        <td class="yellow-cell">${roundUp5(calculated)}</td>
        <td class="yellow-cell">${roundNearest5(calculated)}</td>
        <td class="yellow-cell">${roundDown5(calculated)}</td>
        <td contenteditable="true" data-field="note" data-week="${itemWeek}" data-original-index="${originalIndex}" style="background-color: #fff3cd;">${
        item.note || ""
      }</td>
        <td><button class="exercise-btn" style="padding: 4px 8px; font-size: 16px; white-space: nowrap;" onclick="deleteTemplateRow('${originalIndex}', '${itemWeek}')">삭제</button></td>
      `;
    } else {
      row.innerHTML = `
        <td>${selectedExercise}</td>
        <td>${itemWeek}주차</td>
        <td>${item.category || "Sub"}</td>
        <td>${item.percent}%</td>
        <td>${item.rep}</td>
        <td>${item.round}</td>
        <td class="yellow-cell">${roundUp5(calculated)}</td>
        <td class="yellow-cell">${roundNearest5(calculated)}</td>
        <td class="yellow-cell">${roundDown5(calculated)}</td>
        <td>${item.note || ""}</td>
      `;
    }

    tbody.appendChild(row);
  });

  // 편집 모드일 때 셀 수정 이벤트 추가
  if (isEditMode) {
    // 운동 구분 dropdown 이벤트
    tbody.querySelectorAll("select[data-field='category']").forEach((select) => {
      select.addEventListener("change", (e) => {
        const index = parseInt(e.target.dataset.index);
        const itemWeek = e.target.dataset.week || week;
        const value = e.target.value;

        // 전체 주차 선택 시 실제 데이터에서 찾기
        if (week === "all") {
          const actualWeek = parseInt(itemWeek);
          if (
            templateData[selectedExercise][actualWeek] &&
            templateData[selectedExercise][actualWeek][index] !== undefined
          ) {
            templateData[selectedExercise][actualWeek][index].category = value;
            saveTemplates(templateData);
            generateTemplateTable();
          }
        } else {
          if (templateData[selectedExercise][week] && templateData[selectedExercise][week][index] !== undefined) {
            templateData[selectedExercise][week][index].category = value;
            saveTemplates(templateData);
            generateTemplateTable();
          }
        }
      });
    });

    // 다른 필드 contenteditable 이벤트
    tbody.querySelectorAll("[contenteditable='true']").forEach((cell) => {
      const handleSave = (e) => {
        const index = parseInt(
          e.target.dataset.originalIndex !== undefined
            ? e.target.dataset.originalIndex
            : e.target.closest("tr").dataset.index
        );
        const itemWeek = e.target.dataset.week || week;
        const field = e.target.dataset.field;
        let value = e.target.textContent.trim();

        if (field === "percent" || field === "rep" || field === "round") {
          value = parseInt(value) || 0;
        }

        // 전체 주차 선택 시 실제 데이터에서 찾기
        if (week === "all") {
          const actualWeek = parseInt(itemWeek);
          if (
            templateData[selectedExercise][actualWeek] &&
            templateData[selectedExercise][actualWeek][index] !== undefined
          ) {
            templateData[selectedExercise][actualWeek][index][field] = value;
            saveTemplates(templateData);
            generateTemplateTable(); // 무게 재계산
          }
        } else {
          if (templateData[selectedExercise][week] && templateData[selectedExercise][week][index] !== undefined) {
            templateData[selectedExercise][week][index][field] = value;
            saveTemplates(templateData);
            generateTemplateTable(); // 무게 재계산
          }
        }
      };

      cell.addEventListener("blur", handleSave);
      cell.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.target.blur();
        }
      });
    });
  }
}

function addTemplateRow() {
  const week = document.getElementById("template-week-select").value;
  const targetWeek = week === "all" ? "1" : week; // 전체 선택 시 기본값 1주차

  if (!templateData[selectedExercise]) {
    templateData[selectedExercise] = { 1: [], 2: [], 3: [], 4: [] };
  }
  if (!templateData[selectedExercise][targetWeek]) {
    templateData[selectedExercise][targetWeek] = [];
  }

  templateData[selectedExercise][targetWeek].push({
    category: "Main",
    percent: 100,
    rep: 1,
    round: 1,
    note: "",
  });

  saveTemplates(templateData);
  generateTemplateTable();
}

function deleteTemplateRow(index, itemWeek) {
  const week = document.getElementById("template-week-select").value;
  const targetWeek = itemWeek || week; // 전체 선택 시 실제 주차 정보 사용

  if (templateData[selectedExercise] && templateData[selectedExercise][targetWeek]) {
    templateData[selectedExercise][targetWeek].splice(index, 1);
    saveTemplates(templateData);
    generateTemplateTable();
  }
}

// 전역 함수로 등록 (onclick에서 사용)
window.deleteTemplateRow = deleteTemplateRow;

// 초기화
function init() {
  // 선택된 운동이 없거나 운동 목록에 없으면 첫 번째 운동 선택
  const exercises = Object.keys(exerciseData);
  if (!selectedExercise || !exercises.includes(selectedExercise)) {
    if (exercises.length > 0) {
      selectedExercise = exercises[0];
      saveSelectedExercise(selectedExercise);
    } else {
      selectedExercise = "";
    }
  }

  generateExerciseCalculatorSelect();
  generatePercentageTable();
  generateExerciseList();
  generateBig3();
  generatePercentageFinder();
  generateTemplate();

  // 역산계산기 초기화
  updateReverseCalculator();
}

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", init);
