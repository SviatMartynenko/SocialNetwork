const codeInput = document.getElementById("code-input")
const cellsSpans = document.querySelectorAll('.cell-text');
const cells = document.querySelectorAll('.input-cell');

cells.forEach(cell => {
    cell.addEventListener(
        'click', 
        () => {
            codeInput.focus();
            const currentLength = codeInput.value.length; 
                if(currentLength === 0){
                    const firstCell = cellsSpans[0].closest('.input-cell');
                    firstCell.classList.toggle('border-dark-blue');

                    if (firstCell.classList.contains('border-dark-blue')){
                    cellsSpans[0].innerText = "|";
                    cellsSpans[0].classList.add('text-dark-blue');
                    }
                    else{
                        cellsSpans[0].innerText = "___";
                        cellsSpans[0].classList.remove('text-dark-blue');
                    }
                }
        }
    );
});

codeInput.addEventListener(
    'input',
    (inputField) =>{
        const value = inputField.target.value;
        if (value.length > 6) {
            inputField.target.value = value.slice(0, 6);
        }

        cellsSpans.forEach((cellSpan, index) => {

            cellSpan.innerText = value[index] || "___";
            
            const cell = cellSpan.closest('.input-cell');
            cell.classList.toggle('border-dark-blue', index === value.length);
            
            if (cellSpan.innerText == value[index]){
                cell.classList.remove('border-dark-blue');
                cell.classList.add('border-green');
            }
            else{
                cell.classList.remove('border-green');
                cellSpan.classList.remove('text-dark-blue');
            }

            if (cell.classList.contains('border-dark-blue')){
                cellSpan.innerText = "|";
                cellSpan.classList.add('text-dark-blue');
            }
        });
    }
)
