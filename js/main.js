new Vue({
    el: '#app',
    data: {
        columns: [
            { name: 'FirstColumn', cards: [], maxCards: 3 },
            { name: 'SecondColumn', cards: [], maxCards: 5 },
            { name: 'ThirdColumn', cards: [], maxCards: Infinity }
        ],
        newCard: {
            title: '',
            items: ['', '', '']
        }
    },
    methods: {
        moveCard(card, fromColumn, toColumn) {
            const index = fromColumn.cards.indexOf(card);
            if (index !== -1 && toColumn.cards.length < toColumn.maxCards) {
                fromColumn.cards.splice(index, 1);
                toColumn.cards.push(card);
            }
        },

        checkCompletion(card) {
            const totalItems = card.items.length;
            const completedItems = card.items.filter(item => item.completed).length;
            if (completedItems / totalItems > 0.5 && completedItems < totalItems) {
                this.moveCard(card, this.columns[0], this.columns[1]);
            } else if (completedItems === totalItems) {
                card.completedAt = new Date().toLocaleString();
                this.moveCard(card, this.columns[1], this.columns[2]);
            }
        },

        isFirstColumnLocked() {
            return this.columns[0].cards.length >= this.columns[0].maxCards &&
                this.columns[1].cards.length >= this.columns[1].maxCards;
        },

        addCard() {
            if (this.columns[0].cards.length < this.columns[0].maxCards) {
                const newCard = {
                    title: this.newCard.title,
                    items: this.newCard.items.map(item => ({ text: item, completed: false }))
                };
                this.columns[0].cards.push(newCard);
                this.resetForm();
            } else {
                alert('First column is full. Cannot add more cards.');
            }
        },

        resetForm() {
            this.newCard = {
                title: '',
                items: ['', '', '']
            };
        }
    },

    template: `
    <div>
      <div class="form-container">
        <form @submit.prevent="addCard">
          <div>
            <label for="title">Title:</label>
            <input type="text" id="title" v-model="newCard.title" required>
          </div>
          <div v-for="(item, index) in newCard.items" :key="index">
            <label :for="'item-' + index">Item {{ index + 1 }}:</label>
            <input type="text" :id="'item-' + index" v-model="newCard.items[index]" required>
          </div>
          <button type="submit">Add Card</button>
        </form>
      </div>
      
      <div class="column-container">
          <div v-for="(column, colIndex) in columns" :key="colIndex" class="column">
            <h2>{{ column.name }}</h2>
            <div v-for="(card, cardIndex) in column.cards" :key="cardIndex" class="card">
              <h3>{{ card.title }}</h3>
              <ul>
                <li v-for="(item, itemIndex) in card.items" :key="itemIndex">
                  <input type="checkbox" v-model="item.completed" @change="checkCompletion(card)" :disabled="isFirstColumnLocked() && colIndex === 0">
                  {{ item.text }}
                </li>
              </ul>
              <p v-if="card.completedAt">Completed at: {{ card.completedAt }}</p>
            </div>
          </div>
      </div>
    </div>
  `,

    mounted() {
        // Пример данных для тестирования
        this.columns[0].cards.push({
            title: 'Card 1',
            items: [
                { text: 'Item 1', completed: false },
                { text: 'Item 2', completed: false },
                { text: 'Item 3', completed: false }
            ]
        });
    }
});
