new Vue({
    el: '#app',

    data: {
        columns: [
            { name: 'FirstColumn', cards: [], maxCards: 3 },
            { name: 'SecondColumn', cards: [], maxCards: 5 },
            { name: 'ThirdColumn', cards: [], maxCards: null }
        ],
        newCard: {
            title: '',
            items: ['', '', ''],
            isPriority: false // Новое поле для приоритета
        },
        isLocked: false,
        isPriorityLocked: false // Флаг блокировки из-за приоритетной карточки
    },

    methods: {
        moveCard(card, fromColumn, toColumn) {
            if (fromColumn.cards.includes(card) && toColumn.cards.length < toColumn.maxCards) {
                fromColumn.cards.splice(fromColumn.cards.indexOf(card), 1);
                toColumn.cards.push(card);
            } else if (toColumn.maxCards == null) {
                fromColumn.cards.splice(fromColumn.cards.indexOf(card), 1);
                toColumn.cards.push(card);
            }
        },

        checkFirstColumnCards() {
            if (this.isLocked) return;

            for (const card of this.columns[0].cards) {
                const totalItems = card.items.length;
                const completedItems = card.items.filter(item => item.completed).length;

                if (completedItems / totalItems > 0.5 && completedItems < totalItems) {
                    this.moveCard(card, this.columns[0], this.columns[1]);
                }
            }
        },

        checkCompletion(card) {
            const totalItems = card.items.length;
            const completedItems = card.items.filter(item => item.completed).length;

            if (completedItems === totalItems) {
                card.completedAt = new Date().toLocaleString();
                this.moveCard(card, this.columns[1], this.columns[2]);

                // Снимаем блокировку, если карточка была приоритетной
                if (card.isPriority) {
                    this.isPriorityLocked = false;
                }

                this.isLocked = false;
            } else if (completedItems / totalItems > 0.5 && completedItems < totalItems) {
                if (this.columns[1].cards.length < this.columns[1].maxCards) {
                    this.moveCard(card, this.columns[0], this.columns[1]);
                } else {
                    this.isLocked = true;
                }
            }
        },


        addCard() {
            const validItems = this.newCard.items.filter(item => item.trim() !== '');

            if (validItems.length >= 3 && validItems.length <= 5 && this.columns[0].cards.length < this.columns[0].maxCards && !this.isPriorityLocked) {
                const newCard = {
                    title: this.newCard.title,
                    items: validItems.map(item => ({ text: item, completed: false })),
                    isPriority: this.newCard.isPriority
                };

                if (newCard.isPriority) {
                    this.isPriorityLocked = true;
                }

                this.columns[0].cards.push(newCard);
                this.resetForm();
            } else if (this.isPriorityLocked) {
                alert('Сначала выполните приоритетную задачу');
            } else {
                alert('Введите от 3 до 5 пунктов');
            }
        },

        resetForm() {
            this.newCard = {
                title: '',
                items: ['', '', ''],
                isPriority: false
            };
        },

        addItem() {
            if (this.newCard.items.length < 5) {
                this.newCard.items.push('');
            }
        },

        saveState() {
            localStorage.setItem('appState', JSON.stringify({
                columns: this.columns,
                isLocked: this.isLocked,
                isPriorityLocked: this.isPriorityLocked
            }));
        },

        loadState() {
            const storedState = localStorage.getItem('appState');
            if (storedState) {
                try {
                    const parsedState = JSON.parse(storedState);
                    this.columns = parsedState.columns;
                    this.isLocked = parsedState.isLocked;
                    this.isPriorityLocked = parsedState.isPriorityLocked || false; // По умолчанию false, если не было сохранено
                } catch (e) {
                    console.error('Ошибка при разборе сохраненного состояния:', e);
                    localStorage.removeItem('appState');
                }
            }
        },


        clearAllCards() {
            this.columns.forEach(column => {
                column.cards = [];
            });
            this.isLocked = false;
            this.saveState();
        }
    },

    watch: {
        'newCard.items': {
            handler(newItems) {
                if (newItems.length < 5 && newItems[newItems.length - 1]) {
                    this.addItem();
                }
            },
            deep: true
        },

        columns: {
            handler(newColumns) {
                if (!this.isLocked) {
                    this.checkFirstColumnCards();
                }
                this.saveState();
            },
            deep: true
        },

        isLocked: function(newVal) {
            this.saveState();
        }
    },

    mounted() {
        this.loadState();
    },

    computed: {
        itemRequired() {
            return this.newCard.items.map((item, index) => index < 3 || item.trim() !== '');
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
                <input type="text" :id="'item-' + index" v-model="newCard.items[index]" :required="itemRequired[index]">
            </div>
            <div>
                <input type="checkbox" id="isPriority" v-model="newCard.isPriority">
                <label for="isPriority">Приоритетная</label>
            </div>
            <button type="submit" :disabled="isLocked || isPriorityLocked">Add Card</button>
        </form>
      </div>
      <div v-for="(column, colIndex) in columns" :key="colIndex" class="column">
        <h2>{{ column.name }}</h2>
        <div v-for="(card, cardIndex) in column.cards" :key="card.title + cardIndex" class="card">
            <h3>{{ card.title }}</h3>
            <p v-if="card.isPriority">Приоритетная</p>
            <ul>
                <li v-for="(item, itemIndex) in card.items" :key="itemIndex">
                    <input type="checkbox" 
                           v-model="item.completed" 
                           @change="checkCompletion(card)" 
                           :disabled="!card.isPriority && isPriorityLocked || colIndex === 2">
                    {{ item.text }}
                </li>
            </ul>
            <p v-if="card.completedAt">Completed at: {{ card.completedAt }}</p>
        </div>
      </div>
      <p v-if="isPriorityLocked">Приложение заблокировано. Сначала выполните приоритетную задачу.</p>

      <p v-if="isLocked">Первый столбец заблокирован. Завершите одну из карточек во втором столбце.</p>
    </div>
  `,
});
