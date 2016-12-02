//jshint ignore:start
function Individual() {
	this.genome = [];
	this.distance = 0;
	this.fitness = 0;

	this.TEMPORARY_CROSSOVER_PARENT_RETURN_INFO = undefined;
}

main.genetics = {
	individuals: [],
	populationLength: 100,

	genomeLength: 3,

	mutationProbability: 0.4,
	useUnusedGeneProbability: 0.7, //probability

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

	//TODO: in crossover function, swap unusedgene and uncommon genes in the end of the loop
	crossoverParents: function(parent1, parent2) {
		if (parent1.genome.length != parent2.genome.length)
			throw Error("Parent 1 and 2 do not have equivalent genome lengths!");

		var commonGenes = [],
			uncommonGenes = [],
			//use concat to dereference unusedGenes variable from main.randomPoints
			unusedGenes = main.randomPoints.concat(),

			childGenome = [],
			genomeLength = parent1.genome.length,

			indexOfCoords = main.genetics.indexOfObjectCoordinates,

			//probabilties
			mutationProbability = main.genetics.mutationProbability,
			useUnusedGeneProbability = main.genetics.useUnusedGeneProbability;

		//creation of uncommon, common, and unusedGene
		for(var i = 0; i < genomeLength; i++) {

			//we loop through each parent's genome simutaneously
			//and we check each of their genome index's with each other
			//to find common, uncommon, and unused genes
			var parentOneIndex = parent1.genome[i],
				parentTwoIndex = parent2.genome[i];

			var parentOneIndex_in_parentTwoGenome = indexOfCoords(parent2.genome, parentOneIndex),
				parentOneIndex_in_unusedGeneArray = indexOfCoords(unusedGenes, parentOneIndex);

			var parentTwoIndex_in_parentOneGenome = indexOfCoords(parent1.genome, parentTwoIndex);

			if(parentOneIndex_in_parentTwoGenome != -1)
				commonGenes.push(parentOneIndex);
			else
				uncommonGenes.push(parentOneIndex);

			unusedGenes.splice(parentOneIndex_in_unusedGeneArray, 1);

			//if true, we will define parentTwoIndex_in_unusedGeneArray
			if(parentTwoIndex_in_parentOneGenome == -1) {
				uncommonGenes.push(parentTwoIndex);
				unusedGenes.splice(indexOfCoords(unusedGenes, parentTwoIndex), 1);
			}
		}
		
		//concat() to dereference
		var _commonGenes = commonGenes.concat(),
			_uncommonGenes = uncommonGenes.concat(),
			_unusedGenes = unusedGenes.concat();

		//creation of childGenome	
		for (var j = 0; j < genomeLength; j++) {

			var useCommonGenes = commonGenes.length > 0 && !(Math.random() < mutationProbability);

			if (useCommonGenes) {
				var randomIndex = Math.floor(Math.random() * (commonGenes.length));

				childGenome.push(commonGenes[randomIndex]);
				commonGenes.splice(randomIndex, 1);

				continue;
			}

			var useUnusedGeneArrayForMutation = (Math.random() <= useUnusedGeneProbability)	&&
				unusedGenes.length !== 0;
			
			if (useUnusedGeneArrayForMutation) {
				main.genetics.pushMutatedGene(true, unusedGenes, uncommonGenes, childGenome);
				
				continue;

			} else {

				//if uncommongenes is empty, push random index commongene index
				if (uncommonGenes.length === 0) {
					var randomIndex = Math.floor(Math.random() * (commonGenes.length));

					childGenome.push(commonGenes[randomIndex]);
					commonGenes.splice(randomIndex, 1);

					continue;
				}

				//we're using ucommon genes because we didn't choose to use unusedgenes
				main.genetics.pushMutatedGene(false, unusedGenes, uncommonGenes, childGenome);

			}

		}


		return {
			childGenome: childGenome,

			parent1: parent1,
			parent2: parent2,

			//info
			common: _commonGenes,
			uncommonGenes: _uncommonGenes,
			unusedgenes: _unusedGenes
		};

	},

	pushMutatedGene: function(useUnusedGeneArray, unusedGenes, uncommonGenes, childGenome) {
		var genePoolChoice = useUnusedGeneArray ? unusedGenes : uncommonGenes,
			randomIndex = Math.floor(Math.random() * (genePoolChoice.length));

		childGenome.push(genePoolChoice[randomIndex]);
		genePoolChoice.splice(randomIndex, 1);
	},

	initIndividual: function(crossParent1, crossParent2) {
		var individual = new Individual();

		var TEMPORARY_CROSSOVER_PARENT_RETURN_INFO = main.genetics.crossoverParents(crossParent1, crossParent2);

		individual.genome = TEMPORARY_CROSSOVER_PARENT_RETURN_INFO.childGenome;
		individual.TEMPORARY_CROSSOVER_PARENT_RETURN_INFO = TEMPORARY_CROSSOVER_PARENT_RETURN_INFO;


		individual.distance = main.calculateSumOfDistances(individual.genome);
		individual.fitness = individual.genome.length / individual.distance;

		return individual;
	},

	getFittestIndividual: function(populationArray) {
		var fittest = populationArray[0],
			_tempArray = [];

		for (var i = 1; i < populationArray.length; i++)

			if (fittest.fitness < populationArray[i].fitness)
				fittest = populationArray[i];

		return fittest;
	},

	//creates random genome from random coordinates array
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

			//minues 1 from populationLength because we push fittestIndividual
			for (var i = 0; i < main.genetics.populationLength - 1; i++) {
				var parent1 = this.tournamentSelection(this.individuals),
					parent2 = this.tournamentSelection(this.individuals),
					child = new Individual();

				/*
					Check if parent1 is equal to parent2

					reason for checking fitness score is because
					two parents can't have two of the same fitness scores
					unless they have the same genes
				*/

				// while (parent1.fitness == parent2.fitness) {
				// 	parent2 = this.tournamentSelection(this.individuals);
				// }

				//child.genome = this.crossoverParents(parent1, parent2);
				var TEMPORARY_CROSSOVER_PARENT_RETURN_INFO = this.crossoverParents(parent1, parent2);
				child.genome = TEMPORARY_CROSSOVER_PARENT_RETURN_INFO.childGenome;
				child.TEMPORARY_CROSSOVER_PARENT_RETURN_INFO = TEMPORARY_CROSSOVER_PARENT_RETURN_INFO;
				
				child.distance = main.calculateSumOfDistances(child.genome);
				child.fitness = child.genome.length / child.distance;

				newGeneration.push(child);
			}

		}

		newGeneration.push(this.getFittestIndividual(this.individuals));
		
		console.log("Average Fitness of Generation: " + this.averageFitnessOfGeneration(newGeneration));
		
		this.individuals = newGeneration;

		main.drawOnly = {
			color: "red",
			connections: main.genetics.getFittestIndividual(this.individuals).genome
		};

		main.renderConnections(main.canvas);

	},

	tournamentSelection: function(individuals) {
		var randomlySelected = [];

		if (main.genetics.tournamentSize >= main.genetics.populationSize)
			throw Error("Tournament size is greater than the amount of individuals.");

		for (var i = 0; i < main.genetics.tournamentSize; i++)
			randomlySelected.push(individuals[Math.floor(Math.random() * individuals.length)]);

		var bestIndividual = randomlySelected[0];

		for (var j = 0; j < randomlySelected.length; j++) {
			if (randomlySelected[j].fitness > bestIndividual.fitness)
				bestIndividual = randomlySelected[j];
		}

		return individuals[Math.floor(Math.random() * individuals.length)];

	},

	averageFitnessOfGeneration: function(population) {
		var sumOfFitnesses = 0;

		for (var i = 0; i < population.length; i++) {
			sumOfFitnesses += population[i].fitness;
		}

			return sumOfFitnesses / population.length;
	},

};