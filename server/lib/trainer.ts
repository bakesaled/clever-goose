import * as natural from 'natural';
import { readJson } from 'fs-extra';
import { DataSet } from '../interfaces/data-set';

export class Trainer {
  private trainingSets: DataSet[];
  private testSets: DataSet[];

  train() {
    this.getData('server/test-sets', 'frequency', 'macro')
      .then(result => {
        this.testSets = result;
        console.log('Test set size: ' + this.testSets.length);
      })
      .then(() => {
        this.getData('server/training-sets', 'frequency', 'macro')
          .then(result => {
            this.trainingSets = result;
            console.log('Training set size: ' + this.trainingSets.length);

            this.preprocess(this.trainingSets);

            const bayesClassifier = new natural.BayesClassifier();
            this.doTraining(bayesClassifier);
            this.evaluate(bayesClassifier);

            const logisticClassifier = new natural.LogisticRegressionClassifier();
            this.doTraining(logisticClassifier);
            this.evaluate(logisticClassifier);
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
  }

  private getData(folderName, setNameA, setNameB) {
    return readJson(`${folderName}/set-${setNameA}.json`).then(setA => {
      return readJson(`${folderName}/set-${setNameB}.json`).then(setB => {
        const list = [
          ...setA.data.map(text => ({ text, classification: setNameA })),
          ...setB.data.map(text => ({ text, classification: setNameB }))
        ];
        this.shuffleArray(list);
        return Promise.resolve(list);
      });
    });
  }

  private doTraining(classifier) {
    this.trainingSets.forEach(set => {
      classifier.addDocument(set.text, set.classification);
    });

    classifier.train();
  }

  private preprocess(dataSet: DataSet[]) {
    dataSet.forEach(set => {
      set.text.toLowerCase();
    });
  }

  private evaluate(classifier) {
    let correctCount = 0;
    this.testSets.forEach(set => {
      if (classifier.classify(set.text) === set.classification) {
        correctCount++;
      }
    });
    const accuracy = correctCount / this.testSets.length;
    console.log(
      'Accuracy: ' + (accuracy * 100).toFixed(1) + '%',
      classifier.constructor.name
    );
  }

  private shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
