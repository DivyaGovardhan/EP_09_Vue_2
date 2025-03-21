new Vue({
    el: '#app',
    data: {
        columns: [
            { name: 'FirstColumn', cards: [], maxCards: 3 },
            { name: 'SecondColumn', cards: [], maxCards: 5 },
            { name: 'ThirdColumn', cards: [], maxCards: Infinity }
        ]
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
        }
    },

    template: `
    <div>
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
  `,

    mounted() {
        // Пример данных для тестирования
        this.columns[0].cards.push({
            title: 'Card 1',
            items: [
                { text: 'Разработать электронную версию', completed: false },
                { text: 'Создать экземпляр игры', completed: false },
                { text: 'Продать партию игр', completed: false }
            ]
        });
    }
});
