import * as natural from 'natural';

export class Trainer {
  train() {
    const bayesClassifier = new natural.BayesClassifier();
    this.doTraining(bayesClassifier);

    const logisticClassifier = new natural.LogisticRegressionClassifier();
    this.doTraining(logisticClassifier);
  }

  private doTraining(classifier) {
    classifier.addDocument(['fat', '10%', 'limit'], 'unhealthy');
    classifier.addDocument(['carbohydrates', '60%'], 'unhealthy');
    classifier.addDocument(['carbohydrates', '20%'], 'healthy');
    classifier.addDocument(['fat', '60%'], 'healthy');
    classifier.addDocument(['meals', '2', 'two'], 'healthy');
    classifier.addDocument(['meals', '5', 'five'], 'unhealthy');
    classifier.train();

    console.log(classifier.classify('Limit your fat consumption'));
    console.log(classifier.classify('Eat mostly healthy carbohydrates'));
    console.log(classifier.classify('Eat six meals a day'));
    console.log(classifier.classify('Eat two meals a day'));
    console.log(classifier.classify('I get 80% of my calories from fat'));
    console.log('--------');
  }
}
