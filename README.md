Fair Dice Game : <br>
<br>
This is a command-line-based fair dice game where you compete against the computer using sets of dice. The game uses cryptographic techniques (HMAC) to ensure transparency and fairness in random number generation and decision-making.<br>
**How to Play :** <br>
<br>
**Game Setup**<br>
Provide at least two sets of dice as command-line arguments.<br>
Each set of dice should be a comma-separated list of integers (representing the dice sides).<br>

Example:<br>
`node game.js 3,5,8,3,6,7 8,4,0,3,8,4 6,8,2,0,4,7`<br>
This command initializes the game with three dice sets:<br>

[3,5,8,3,6,7]
[8,4,0,3,8,4]
[6,8,2,0,4,7]
<br>
Game Steps<br>
Determine Who Throws First:
<br>
The computer randomly chooses 0 or 1 (using an HMAC-based random process).<br>
You guess the computer’s selection.<br>
If your guess is correct, you throw first. Otherwise, the computer throws first.<br>
<br>
Choose Dice:<br>

Whoever throws first selects a dice set first.<br>
The other player then selects their dice from the remaining sets.<br>
<br>
Throw Dice:
<br>
During a throw, the computer generates a random number modulo the number of sides (6 in this case).<br>
You also provide a number (modulo 6), which is added to the computer’s number, and the modulo operation determines the final dice result.<br>
The dice value corresponding to the index of the result (modulo operation) is considered the throw.<br>
<br>
Decide the Winner:
<br>
The player with the higher dice throw value wins that round.<br>
Game Exit and Help:<br>
<br>
Enter X to exit the game.<br>
Enter ? to display the win probabilities for all dice combinations.<br>
<br>
**How Win Probabilities Are Calculated**<br>
The win probability calculation is based on pairwise comparisons between dice sets. For each pair of dice sets, we calculate the probability that one dice set will win against the other.
<br>
**Steps:**
Compare all possible outcomes between two dice sets:<br>
<br>
For each side of one dice, compare it to each side of the other dice.<br>
Count the total wins (where a side of one dice is greater than the side of the other dice).<br>

**Calculate the probability:**
<br>
Divide the number of wins by the total number of comparisons (product of the number of sides in both dice sets).<br>
Example: Consider two dice sets:<br>

`Dice 1: [3, 5, 8]`
`Dice 2: [4, 6, 7]`<br>
Total comparisons = 3 (sides in Dice 1) × 3 (sides in Dice 2) = 9<br>
**Winning comparisons:**
<br>
`3 vs 4 → lose`
`3 vs 6 → lose`
`3 vs 7 → lose`
`5 vs 4 → win`
`5 vs 6 → lose`
`5 vs 7 → lose`
`8 vs 4 → win`
`8 vs 6 → win`
`8 vs 7 → win`
`Total wins = 4`.
`Probability = 4/9 ≈ 0.4444.`
<br>
**Display Format:**<br>
During the game, the win probabilities are shown in a table format.<br>
Example:<br>
<img width="907" alt="Screenshot 2024-12-04 at 4 48 32 PM" src="https://github.com/user-attachments/assets/b043ae76-924c-4914-a896-0755e1c1f496">
<br>
**Example Verification**<br>
Computer's Output:<br>
HMAC provided before revealing:<br>

`I selected a random value in the range 0..1 (HMAC=5d41402abc4b2a76b9719d911017c592).`<br>
Later, the computer reveals:<br>

`My selection: 0 (KEY=secretkey123).`
<br>
Verify in Python:
<br>
`import hmac`<br>
`import hashlib`<br>

`key = b'secretkey123'`<br>
`message = b'0'  # The computer's selection`<br>
`computed_hmac = hmac.new(key, message, hashlib.sha256).hexdigest()`<br>

`print(computed_hmac)`<br>
`# Output: 5d41402abc4b2a76b9719d911017c592`<br>
`If the output matches the HMAC displayed by the computer, the random choice was fair.`<br>
**Key Features**
HMAC Transparency:<br>
<br>
All random selections made by the computer are protected by an HMAC (Hash-Based Message Authentication Code). The HMAC is shown before revealing the actual choice to ensure fairness.
After each step, the key used to generate the HMAC is revealed, allowing players to verify the fairness of the random selection.<br>
**Help Functionality:**
<br>
Enter ? at any point to view the winning probabilities for all dice sets.
<br>
**Requirements**
Node.js installed on your system.<br>
<br>
**Installation**<br>
Clone this repository or download the source code.
Navigate to the directory in your terminal.
<br>
Run the game using:

`node game.js [dice set 1] [dice set 2] ...`

