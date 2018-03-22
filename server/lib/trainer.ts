import * as natural from 'natural';
import { readJson } from 'fs-extra';
import { DataSet } from '../interfaces/data-set';

export class Trainer {
  private trainingSets: DataSet[] = [];
  private testSets: DataSet[] = [];

  train() {
    this.trainMacroFrequency()
      .then(() => {
        this.clear();
        this.trainHealthyUnhealthy().catch(err => console.error(err));
      })
      .catch(err => console.error(err));
  }

  private trainMacroFrequency() {
    console.log('--------');
    console.log('Training Macro-Frequency');
    return Promise.all([
      this.getData('server/training-sets', 'frequency', 'macro').then(
        result => {
          this.trainingSets = [...this.trainingSets, ...result];
        }
      ),
      this.getData('server/test-sets', 'frequency', 'macro').then(result => {
        this.testSets = [...this.testSets, ...result];
      })
    ])
      .then(() => {
        console.log('Training set size: ' + this.trainingSets.length);
        console.log('Test set size: ' + this.testSets.length);

        this.preprocess(this.trainingSets);

        const bayesClassifier = new natural.BayesClassifier();
        this.doTraining(bayesClassifier);
        this.evaluate(bayesClassifier);

        const logisticClassifier = new natural.LogisticRegressionClassifier();
        this.doTraining(logisticClassifier);
        this.evaluate(logisticClassifier);
      })
      .catch(err => console.error(err));
  }

  private trainHealthyUnhealthy() {
    console.log('--------');
    console.log('Training Healthy-Unhealthy');
    return Promise.all([
      this.getData('server/training-sets', 'healthy', 'unhealthy').then(
        result => {
          this.trainingSets = [...this.trainingSets, ...result];
        }
      ),
      this.getData('server/test-sets', 'healthy', 'unhealthy').then(result => {
        this.testSets = [...this.testSets, ...result];
      })
    ])
      .then(() => {
        console.log('Training set size: ' + this.trainingSets.length);
        console.log('Test set size: ' + this.testSets.length);

        this.preprocess(this.trainingSets);

        const bayesClassifier = new natural.BayesClassifier();
        this.doTraining(bayesClassifier);
        this.evaluate(bayesClassifier);

        const logisticClassifier = new natural.LogisticRegressionClassifier();
        this.doTraining(logisticClassifier);
        this.evaluate(logisticClassifier);
      })
      .catch(err => console.error(err));
  }

  private clear() {
    this.trainingSets = [];
    this.testSets = [];
  }

  private getData(folderName, ...setNames) {
    let list = [];
    return Promise.all(
      setNames.map(name => {
        return readJson(`${folderName}/set-${name}.json`).then(set => {
          list = [
            ...list,
            ...set.data.map(text => ({ text, classification: name }))
          ];
        });
      })
    ).then(() => {
      this.shuffleArray(list);
      return Promise.resolve(list);
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
      // console.log(
      //   'classifier: ',
      //   set.text,
      //   classifier.getClassifications(set.text)
      // );
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
