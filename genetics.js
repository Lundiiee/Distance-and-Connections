//jshint ignore:start
function Individual() {
	this.genome = [];
	this.distance = 0;
	this.fitness = 0;
}

main.genetics = {
	individuals: [],
	populationLength: 20,

	genomeLength: 3,

	mutationProbability: 0.25,
	unusedGeneInheritance: 0.3, //probability

	useTournamentSelection: true,

	//initialized in init()
	//affects tournament pressure
	tournamentSize: undefined,

	initIndividuals: function() {
		for (var i = 0; i < this.populationLength; i++) {
			this.individuals.push(new Individual());
			this.individuals[this.individuals.length - 1].genome = this.createRandGenome(main);

			this.individuals[this.individuals.length - 1].distance = main.calculateSumOfDistances(this.individuals[this.individuals.length - 1].genome);

			//Fitness equals ratio of connections (genome length) to distance
			//(connections per unit distance)
			//F = C / D
			this.individuals[this.individuals.length - 1].fitness = this.individuals[this.individuals.length - 1].genome.length /
				this.individuals[this.individuals.length - 1].distance;
			}
	},

	crossoverParents: function(parent1, parent2) {
		if (parent1.genome.length != parent2.genome.length)
			throw Error("Parent 1 and 2 do not have equivalent genome lengths!");

		var commonGenes = [],
			uncommonGenes = [],
			//call concat to dereference unusedGenes variable from main.randomPoints
			unusedGenes = main.randomPoints.concat(),

			childGenome = [],
			genomeLength = parent1.genome.length,

			indexOfCoords = main.genetics.indexOfObjectCoordinates,

			mutationProbability = main.genetics.mutationProbability,
			unusedGeneInheritance = main.genetics.unusedGeneInheritance;

		for (var i = 0; i < genomeLength; i++) {
			var par1 = parent1.genome[i],
				par2 = parent2.genome[i];

			var index = indexOfCoords(parent2.genome, par1),
				parentTwoElementNotInParent1 = indexOfCoords(parent1.genome, par2) == -1,

				parentOneElementIndexInUnused = indexOfCoords(unusedGenes, par1),
				parentTwoElementIndexInUnusued = undefined;

			if (index != -1)
				commonGenes.push(par1);
			else
				uncommonGenes.push(par1);

			if (parentTwoElementNotInParent1) {
				uncommonGenes.push(par2);
				parentTwoElementIndexInUnusued = indexOfCoords(unusedGenes, par2);

				unusedGenes.splice(parentTwoElementIndexInUnusued, 1);
			}

			unusedGenes.splice(parentOneElementIndexInUnused, 1);

		}

		function pushMutatedGene(mutationToUnusedGene, unusedGenes, uncommonGenes) {
			var genePoolChoice = mutationToUnusedGene ? unusedGenes : uncommonGenes,
				randomIndex = Math.floor(Math.random() * (genePoolChoice.length));

			childGenome.push(genePoolChoice[randomIndex]);
			uncommonGenes.splice(randomIndex, 1);
		}

		//creation of childGenome
		for (var j = 0; j < genomeLength; j++) {
			var probability = commonGenes.length !== 0 && (Math.random() < mutationProbability);

			if (probability === true) {

				var randomIndex = Math.floor(Math.random() * (commonGenes.length));

				childGenome.push(commonGenes[randomIndex]);
				commonGenes.splice(randomIndex, 1);

				continue;
			}

			var useUnusedGeneArrayForMutation = Math.random() <= unusedGeneInheritance;

			if (unusedGenes.length === 0)
				useUnusedGeneArrayForMutation = false;

			if (useUnusedGeneArrayForMutation) {

				pushMutatedGene(useUnusedGeneArrayForMutation, unusedGenes, uncommonGenes);
				continue;

			} else {

				if (uncommonGenes.length === 0) {
					
					var commonGenesRandomIndex = Math.floor(Math.random() * (commonGenes.length));

					childGenome.push(commonGenes[commonGenesRandomIndex]);
					childGenome.splice(commonGenesRandomIndex, 1);
					continue;
				}

				pushMutatedGene(useUnusedGeneArrayForMutation, unusedGenes, uncommonGenes);
			}
		}

		// if(childGenome.length === 2) {
		// 	throw Error("a");
		// }

		return childGenome;

 	},

 	_test: function() {
 		var parent1 = new Individual(),
 			parent2 = new Individual();

 		parent1.genome = main.genetics.crossoverParents(main.genetics.individuals[0], main.genetics.individuals[1]);
 		parent2.genome = main.genetics.crossoverParents(main.genetics.individuals[0], main.genetics.individuals[1]);

 		parent1.distance = main.calculateSumOfDistances(parent1.genome);
 		parent2.distance = main.calculateSumOfDistances(parent2.genome);

 		parent1.fitness = parent1.genome.length / parent1.distance;
 		parent2.fitness = parent2.genome.length / parent2.distance;
 		
 		//shouldn't be the same

 		//distance, fitness, genome
 		
 		for(var i = 0; i < 12; i++) {
 			console.log(i);

 			var a = main.genetics.initIndividual(parent1, parent2),
 				b = main.genetics.initIndividual(parent1, parent2);

	 		var c = main.genetics.initIndividual(a, b),
	 			d = main.genetics.initIndividual(a, b);

	 		parent1 = c;
	 		parent2 = d;

 		}
 		
 		return parent1.genome.length == parent2.genome.length;
 	},


 	initIndividual: function(crossParent1, crossParent2) {
 		var individual = new Individual();

 		individual.genome = main.genetics.crossoverParents(crossParent1, crossParent2);
 		individual.distance = main.calculateSumOfDistances(individual.genome);
 		individual.fitness = individual.genome.length / individual.distance;

 		return individual;
 	},

	getFittestIndividual: function(populationArray) {
		var fittest = populationArray[0],
			_tempArray = [];

		for (var i = 1; i < populationArray.length; i++) {

			if (fittest.fitness < populationArray[i].fitness)
				fittest = populationArray[i];

			else if (fittest.fitness == populationArray[i].fitness)
				_tempArray.push(populationArray[i]);

		}

		console.log(_tempArray);
		return fittest;
	},

	//creates random genome from random coordinates
	createRandGenome: function() {
		var genome = [];
		for (var i = 0; i < this.genomeLength; i++) {
			var randomIndex = Math.floor(Math.random() * (main.randomPoints.length));

			//to not have two of the same gene, change the index to something elese
			while (genome.indexOf(main.randomPoints[randomIndex]) > -1)
				randomIndex = Math.floor(Math.random() * (main.randomPoints.length));

			genome.push(main.randomPoints[randomIndex]);
		}

		return genome;
	},

	indexOfObjectCoordinates: function(array, object) {
		for (var i = 0; i < array.length; i++)
			if (array[i].x == object.x && array[i].y == object.y)
				return i;

		return -1;
	},

	createGeneration: function() {

		if (this.individuals.length === 0) {
			this.initIndividuals();
			console.log("Initindividuals() called because individuals array is empty!");
		}

		var newGeneration = [];

		if (this.useTournamentSelection) {

			for (var i = 0; i < main.genetics.populationLength; i++) {
				var parent1 = this.tournamentSelection(this.individuals),
					parent2 = this.tournamentSelection(this.individuals),
					child = new Individual();

				child.genome = this.crossoverParents(parent1, parent2);
				if(child.genome.length != parent1.genome.length){
					console.log(child.genome);
					console.log(parent1.genome);
					throw Error();
				}

				child.distance = main.calculateSumOfDistances(child.genome);
				child.fitness = child.genome.length / child.distance;

				newGeneration.push(child);
			}

		}
		//console.log(newGeneration[0]);
		console.log(this.averageFitnessOfGeneration(newGeneration));
		this.individuals = newGeneration;

	},

	tournamentSelection: function(individuals) {
		var randomlySelected = [];

		if (main.genetics.tournamentSize >= main.genetics.populationSize)
			throw Error("Tournament size is greater than the amount of individuals.");

		for (var i = 0; i < main.genetics.tournamentSize; i++) {
			randomlySelected.push(individuals[Math.floor(Math.random() * individuals.length)]);
		}


		var bestIndividual = randomlySelected[0];
		for (var j = 0; j < randomlySelected.length; j++) {
			if (randomlySelected[j].fitness > bestIndividual.fitness)
				bestIndividual = randomlySelected[j];
		}

		return bestIndividual;

	},

	averageFitnessOfGeneration: function(population) {
		var sumOfFitnesses = 0;

		for(var i = 0; i < population.length; i++) {
			sumOfFitnesses += population[i].fitness;
		}
		
		return sumOfFitnesses / population.length;
	},

};