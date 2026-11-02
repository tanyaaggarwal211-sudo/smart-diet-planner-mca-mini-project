// Smart Diet Planner - basic JavaScript functionality

document.addEventListener("DOMContentLoaded", function () {

    // HOME PAGE: open the diet plan page
    const createPlanBtn = document.getElementById("createPlanBtn");
    if (createPlanBtn) {
        createPlanBtn.addEventListener("click", function () {
            window.location.href = "myPlan.html";
        });
    }

    // MY PLAN PAGE: validate the form and display a simple suggested plan
    const dietForm = document.getElementById("dietForm");
    if (dietForm) {
        dietForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value.trim();
            const age = Number(document.getElementById("age").value);
            const height = Number(document.getElementById("height").value);
            const weight = Number(document.getElementById("weight").value);
            const goal = document.getElementById("goal").value;
            const preference = document.getElementById("foodPreference").value;
            const gender = document.querySelector('input[name="gender"]:checked');
            const result = document.getElementById("planResult");

            if (!gender) {
                alert("Please select your gender.");
                return;
            }

            if (!name || age < 1 || height < 1 || weight < 1 || !goal || !preference) {
                alert("Please complete all fields with valid values.");
                return;
            }

            const bmi = weight / ((height / 100) * (height / 100));
            let goalText = "maintain your current weight";
            if (goal === "loss") goalText = "work towards gradual weight loss";
            if (goal === "gain") goalText = "work towards gradual weight gain";

            let protein = preference === "vegetarian"
                ? "dal, beans, chickpeas, paneer, curd or milk"
                : "dal, beans, eggs, chicken or fish";

            result.innerHTML = `
                <h2>Your starter plan, ${escapeHTML(name)}!</h2>
                <p><strong>BMI:</strong> ${bmi.toFixed(1)} (a general screening measure, not a diagnosis).</p>
                <p><strong>Your goal:</strong> ${goalText}.</p>
                <ul>
                    <li><strong>Breakfast:</strong> oats or whole-wheat toast with milk/curd and fruit.</li>
                    <li><strong>Lunch:</strong> rice or roti, dal, seasonal vegetables and curd.</li>
                    <li><strong>Snack:</strong> one fruit or a small handful of nuts.</li>
                    <li><strong>Dinner:</strong> vegetables with roti/rice and a protein source such as ${protein}.</li>
                    <li><strong>Daily habit:</strong> drink water regularly and include comfortable physical activity.</li>
                </ul>
                <p>This is a basic educational suggestion, not a medical or calorie-prescribed diet. Individual needs vary.</p>
            `;

            // Save the form details in this browser
            const profile = { name, age, height, weight, goal, preference };
            localStorage.setItem("dietProfile", JSON.stringify(profile));
            result.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
    }

    // FOOD GUIDE PAGE: filter food cards as the user types
    const foodSearch = document.getElementById("foodSearch");
    if (foodSearch) {
        const foodCards = document.querySelectorAll(".food-card");
        const foodCount = document.getElementById("foodCount");

        foodSearch.addEventListener("input", function () {
            const searchText = foodSearch.value.toLowerCase().trim();
            let visibleCards = 0;

            foodCards.forEach(function (card) {
                const cardText = card.innerText.toLowerCase();
                const matches = cardText.includes(searchText);
                card.style.display = matches ? "" : "none";
                if (matches) visibleCards++;
            });

            foodCount.textContent = visibleCards + (visibleCards === 1 ? " food idea" : " food ideas");
        });
    }

    // TRACK PAGE: read today's saved progress or start with sample values
    const waterCountElement = document.querySelector(".water-count");
    if (waterCountElement) {
        let water = Number(localStorage.getItem("waterCount"));
        let activity = Number(localStorage.getItem("activityMinutes"));
        if (!localStorage.getItem("waterCount")) water = 4;
        if (!localStorage.getItem("activityMinutes")) activity = 20;

        const mealBoxes = document.querySelectorAll(".meal-checkbox");
        const savedMeals = localStorage.getItem("mealChecks");
        if (savedMeals) {
            JSON.parse(savedMeals).forEach(function (isChecked, index) {
                if (mealBoxes[index]) mealBoxes[index].checked = isChecked;
            });
        }

        function updateWater() {
            water = Math.max(0, Math.min(8, water));
            const glasses = waterCountElement.querySelectorAll("span");
            glasses.forEach(function (glass, index) {
                glass.classList.toggle("empty", index >= water);
            });
            document.getElementById("waterStatus").textContent =
                "You have had " + water + " glasses today!";
            document.getElementById("waterSummary").textContent = water + " / 8 glasses";
            document.getElementById("waterProgress").style.width = (water / 8 * 100) + "%";
            document.getElementById("waterPercent").textContent = Math.round(water / 8 * 100) + "% of daily goal";
            localStorage.setItem("waterCount", water);
        }

        function updateActivity() {
            activity = Math.max(0, activity);
            document.getElementById("activityNumber").textContent = activity;
            document.getElementById("activitySummary").textContent = activity + " / 30 minutes";
            document.getElementById("activityProgress").style.width = Math.min(activity / 30 * 100, 100) + "%";
            document.getElementById("activityPercent").textContent = Math.round(activity / 30 * 100) + "% of daily goal";
            document.getElementById("activityStatus").textContent =
                activity >= 30 ? "Daily activity goal completed. Great work!" : "Great job! Keep moving.";
            localStorage.setItem("activityMinutes", activity);
        }

        function updateMeals() {
            const completed = Array.from(mealBoxes).filter(function (box) {
                return box.checked;
            }).length;
            document.getElementById("mealStatus").textContent =
                "You have completed " + completed + " out of 3 meals.";
            document.getElementById("mealSummary").textContent = completed + " / 3 meals";
            document.getElementById("mealProgress").style.width = (completed / 3 * 100) + "%";
            document.getElementById("mealPercent").textContent = Math.round(completed / 3 * 100) + "% of daily goal";
            localStorage.setItem("mealChecks", JSON.stringify(
                Array.from(mealBoxes).map(function (box) { return box.checked; })
            ));
        }

        document.getElementById("addWater").addEventListener("click", function () {
            if (water < 8) water++;
            updateWater();
        });
        document.getElementById("resetWater").addEventListener("click", function () {
            water = 0;
            updateWater();
        });
        document.getElementById("addActivity").addEventListener("click", function () {
            activity += 10;
            updateActivity();
        });
        document.getElementById("resetActivity").addEventListener("click", function () {
            activity = 0;
            updateActivity();
        });
        mealBoxes.forEach(function (box) {
            box.addEventListener("change", updateMeals);
        });

        updateWater();
        updateActivity();
        updateMeals();
    }
});

// Prevent user-entered names from being interpreted as HTML
function escapeHTML(value) {
    return value.replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;", "<": "&lt;", ">": "&gt;",
            '"': "&quot;", "'": "&#039;"
        }[character];
    });
}
