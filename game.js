const readline = require("readline-sync");
const crypto = require("crypto");
const Table = require("cli-table3");

// Function to generate HMAC and random values
const generateRandomWithHMAC = (range) => {
    const key = crypto.randomBytes(32).toString("hex");
    const randomValue = Math.floor(Math.random() * range);
    const hmac = crypto.createHmac("sha256", key).update(randomValue.toString()).digest("hex");
    return { randomValue, key, hmac };
};

// Function to display a prompt with validation
const promptUser = (message, validInputs, skipExitCheck = false) => {
    while (true) {
        const input = readline.question(message).trim().toUpperCase();
        if (!skipExitCheck && input === "X") {
            console.log("Game exited.");
            process.exit(0);
        } else if (input === "?") {
            return "?";
        } else if (validInputs.includes(input)) {
            return input;
        } else {
            console.log(`Invalid input. Please select one of: ${validInputs.join(", ")}`);
        }
    }
};

// Function to calculate the winning probabilities for each pair of dice
const calculateWinningProbabilities = (diceSets) => {
    const probabilities = [];
    for (let i = 0; i < diceSets.length; i++) {
        probabilities[i] = [];
        for (let j = 0; j < diceSets.length; j++) {
            if (i === j) {
                probabilities[i][j] = "- (0.3333)"; // Same dice comparison
                continue;
            }
            let wins = 0;
            let total = diceSets[i].length * diceSets[j].length;
            diceSets[i].forEach((die1) => {
                diceSets[j].forEach((die2) => {
                    if (die1 > die2) wins++;
                });
            });
            probabilities[i][j] = (wins / total).toFixed(4); // Showing probability as decimal with 4 places
        }
    }
    return probabilities;
};

// Function to display the winning probability table using cli-table3 library
const displayWinningProbabilities = (diceSets, probabilities) => {
    const table = new Table({
        head: ["User dice \\ Opponent dice", ...diceSets.map((dice) => `[${dice.join(",")}]`)],
        colWidths: [25, ...Array(diceSets.length).fill(20)],
        style: {
            head: ["red"],
            border: ["blue"],
            "padding-left": 1,
            "padding-right": 1,
        },
    });

    for (let i = 0; i < diceSets.length; i++) {
        const row = [`[${diceSets[i].join(",")}]`, ...probabilities[i]];
        table.push(row);
    }

    console.log("\nProbability of the win for the user:");
    console.log(table.toString());
};

// Function to handle throws
const handleThrow = (player, dice, diceSets) => {
    const probabilities = calculateWinningProbabilities(diceSets);
    const isComputer = player === "My"; // Determine if the player is the computer
    const throwLabel = isComputer ? "My throw" : "Your throw"; // Correctly label throws

    while (true) {
        console.log(`It's time for ${throwLabel}.`);
        const { randomValue, key, hmac } = generateRandomWithHMAC(6);
        console.log(`I selected a random value in the range 0..5 (HMAC=${hmac}).`);
        console.log("Add your number modulo 6.");
        console.log("0 - 0\n1 - 1\n2 - 2\n3 - 3\n4 - 4\n5 - 5\nX - exit\n? - help");

        const modInput = promptUser("Your selection: ", ["0", "1", "2", "3", "4", "5"], true);
        if (modInput === "?") {
            displayWinningProbabilities(diceSets, probabilities);
            continue; // Resume the throw step
        }

        const modInputParsed = parseInt(modInput);
        console.log(`My number is ${randomValue} (KEY=${key}).`);
        const resultIndex = (randomValue + modInputParsed) % 6;
        console.log(`The result is ${randomValue} + ${modInputParsed} = ${resultIndex} (mod 6).`);
        console.log(`${throwLabel} is ${dice[resultIndex]}.`);
        return dice[resultIndex];
    }
};

// Game logic
const playGame = (diceSets, step = "start", state = {}) => {
    if (step === "start") {
        console.log("Let's determine who makes the first move.");
        const { randomValue: computerMoveChoice, key: moveKey, hmac: moveHMAC } = generateRandomWithHMAC(2);
        console.log(`I selected a random value in the range 0..1 (HMAC=${moveHMAC}).`);
        console.log("Try to guess my selection.");
        console.log("0 - 0\n1 - 1\nX - exit\n? - help");

        const userGuess = promptUser("Your selection: ", ["0", "1"]);
        if (userGuess === "?") {
            const probabilities = calculateWinningProbabilities(diceSets);
            displayWinningProbabilities(diceSets, probabilities);
            return playGame(diceSets, "start", state); // Do not reset
        }

        console.log(`My selection: ${computerMoveChoice} (KEY=${moveKey}).`);
        const userThrowsFirst = parseInt(userGuess) === computerMoveChoice;

        return playGame(diceSets, "chooseDice", { userThrowsFirst });
    }

    if (step === "chooseDice") {
        const { userThrowsFirst } = state;

        let userDice, computerDice;
        if (!userThrowsFirst) {
            console.log("I make the first move and choose my dice.");
            
            // Generate a verifiable HMAC-based random selection for the computer's dice
            const { randomValue: computerDiceIndex, key: diceKey, hmac: diceHMAC } = generateRandomWithHMAC(diceSets.length);
            // console.log(`I selected a random dice index in the range 0..${diceSets.length - 1} (HMAC=${diceHMAC}).`);
        
            computerDice = diceSets[computerDiceIndex];
            console.log(`I choose the [${computerDice.join(",")}] dice`);
        
            // Allow the user to select their dice from the remaining options
            const remainingDiceSets = diceSets.filter((_, i) => i !== computerDiceIndex);
            remainingDiceSets.forEach((dice, index) => {
                console.log(`${index} - [${dice.join(",")}]`);
            });
            console.log("X - exit\n? - help");
        
            const userDiceSelection = promptUser("Your selection: ", remainingDiceSets.map((_, i) => i.toString()));
            if (userDiceSelection === "?") {
                const probabilities = calculateWinningProbabilities(diceSets);
                displayWinningProbabilities(diceSets, probabilities);
                return playGame(diceSets, "chooseDice", state); // Do not reset
            }
        
            userDice = remainingDiceSets[parseInt(userDiceSelection)];
        } else {
            console.log("You guessed correctly! You throw first.");
            diceSets.forEach((dice, index) => {
                console.log(`${index} - [${dice.join(",")}]`);
            });
            console.log("X - exit\n? - help");

            const userDiceSelection = promptUser("Your selection: ", diceSets.map((_, i) => i.toString()));
            if (userDiceSelection === "?") {
                const probabilities = calculateWinningProbabilities(diceSets);
                displayWinningProbabilities(diceSets, probabilities);
                return playGame(diceSets, "chooseDice", state); // Do not reset
            }

            userDice = diceSets[parseInt(userDiceSelection)];
            computerDice = diceSets.find((_, i) => i !== parseInt(userDiceSelection));
        }

        console.log(`You choose the [${userDice.join(",")}] dice.`);
        console.log(`I choose the [${computerDice.join(",")}] dice.`);

        return playGame(diceSets, "throws", { userThrowsFirst, userDice, computerDice });
    }

    if (step === "throws") {
        const { userThrowsFirst, userDice, computerDice } = state;

        const firstThrower = userThrowsFirst ? "You" : "My";
        const secondThrower = userThrowsFirst ? "My" : "You";

        const firstThrowValue = handleThrow(firstThrower, userThrowsFirst ? userDice : computerDice, diceSets);
        const secondThrowValue = handleThrow(secondThrower, userThrowsFirst ? computerDice : userDice, diceSets);

        console.log("\nFinal Results:");
        if (userThrowsFirst) {
            if (firstThrowValue > secondThrowValue) {
                console.log(`You win (${firstThrowValue} > ${secondThrowValue})!`);
            } else if (firstThrowValue < secondThrowValue) {
                console.log(`I win (${secondThrowValue} > ${firstThrowValue})!`);
            } else {
                console.log(`It's a tie (${firstThrowValue} = ${secondThrowValue})!`);
            }
        } else {
            if (secondThrowValue > firstThrowValue) {
                console.log(`You win (${secondThrowValue} > ${firstThrowValue})!`);
            } else if (secondThrowValue < firstThrowValue) {
                console.log(`I win (${firstThrowValue} > ${secondThrowValue})!`);
            } else {
                console.log(`It's a tie (${secondThrowValue} = ${firstThrowValue})!`);
            }
        }
    }
};

// Parse dice sets from command-line arguments
const diceSets = process.argv.slice(2).map((set) => set.split(",").map(Number));
if (diceSets.length < 2) {
    console.log("Please provide at least two sets of dice as command-line arguments.");
    process.exit(1);
}
//hello

playGame(diceSets);


