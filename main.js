/*
	Optimizing DC problem
	Science Fair 2016-17

	Distance and Connections Problem -

	Given a coordinate A, preferably origin, and N amount of random coordinates B,  
	what is the most amount of connections from coordinate A to any random 
	B coordinate while keeping the sum of distance D < K, or while optimizing solutions for the 
	best fitness score of the ratio of connections to distance.

	I don't know what I'm doing.
*/

/*
	TODO:
	Make the x and y of distance text relative to the slope of the lines
	so it doesn't intersect

	Clean up RenderConnection function code

	Clean up CrossoverParents function - four indexOf calls? what?!!

*/


//Part of genetic algorithms
function Individual() {
	this.genome = [];
	this.distance = 0;
	this.fitness = 0;
}

var main = {
	//node in which distance calculation is based on
	mainCoordinate: {
		x: 0,
		y: 0
	},

	nodeWidth: 20,
	nodeHeight: 20,

	canvasWidth: 750,
	canvasHeight: 750,

	randomPoints: [],
	amountOfRandomPoints: 4,

	//max x and y for random point generation
	maxX: null,
	maxY: null,

	printDistance: false,

	canvasObject: document.getElementById("canvas"),
	canvas: null,

	enableGeneticOptimization: true,

	init: function() {
		if(main.amountOfRandomPoints <= main.genetics.genomeLength)
			throw Error("Oi. Random points less than genome length mate! That can't do!");

		main.canvasObject.width = main.canvasWidth;
		main.canvasObject.height = main.canvasHeight;

		//since main node is offsetted in canvas to be at center,
		//the max will only go up to half of its potential
		main.maxX = main.canvasWidth / 2;
		main.maxY = main.canvasHeight / 2;

		main.canvas = main.canvasObject.getContext('2d');

		for(var i = 0; i < main.amountOfRandomPoints; i++) {
			main.randomPoints.push({
				x: Math.floor(Math.random() * (main.maxX * 2 + 1) - main.maxX),
				y: Math.floor(Math.random() * (main.maxY * 2 + 1) - main.maxY)
			});
		}

		main.renderConnections(main.canvas);

		if(main.enableGeneticOptimization)
			main.genetics.initIndividuals();
	},

	genetics: {
		individuals: [],
		populationLength: 2,

		genomeLength: 3,

		mutationProbability: 0.25,
		unusedGeneInheritance: 0.3, //probability

		initIndividuals: function() {
			for(var i = 0; i < this.populationLength; i++) {
				this.individuals.push(new Individual());
				this.individuals[this.individuals.length-1].genome = this.createRandGenome(main);
				
				this.individuals[this.individuals.length-1].distance = main.calculateSumOfDistances(this.individuals[this.individuals.length-1].genome);

				//Fitness equals ratio of connections (genome length) to distance
				//(connections per unit distance)
				//F = C / D
				this.individuals[this.individuals.length-1].fitness = this.individuals[this.individuals.length-1].genome.length /
																	  this.individuals[this.individuals.length-1].distance;
			}
		},

		crossoverParents: function(parent1, parent2) {
			if(parent1.genome.length != parent2.genome.length)
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

			for(var i = 0; i < genomeLength; i++) {
				var par1 = parent1.genome[i],
					par2 = parent2.genome[i];

				var index = indexOfCoords(parent2.genome, par1),
					parentTwoElementNotInParent1 = indexOfCoords(parent1.genome, par2) == -1,

					parentOneElementIndexInUnused = indexOfCoords(unusedGenes, par1),
					parentTwoElementIndexInUnusued = undefined;

				if(index != -1) 
					commonGenes.push(par1);
				else
					uncommonGenes.push(par1);

				if(parentTwoElementNotInParent1) {
					uncommonGenes.push(par2);
					parentTwoElementIndexInUnusued = indexOfCoords(unusedGenes, par2);

					unusedGenes.splice(parentTwoElementIndexInUnusued, 1);
				}

				unusedGenes.splice(parentOneElementIndexInUnused, 1);				

			}

			function pushMutatedGene(mutationToUnusedGene, unusedGenes, uncommonGenes) {
				var genePoolChoice = mutationToUnusedGene ? unusedGenes : uncommonGenes,
					randomIndex = Math.floor(Math.random() * (genePoolChoice.length+1));

				childGenome.push(uncommonGenes[randomIndex]);
				uncommonGenes.splice(randomIndex, 1);
			}

			//creation of childGenome
			
			for(var i = 0; i < genomeLength; i++) {
				var probability = (Math.random() > mutationProbability) && commonGenes.length != 0;
				
				if(probability) {
					var randomIndex = Math.floor(Math.random() * (commonGenes.length + 1));
					
					childGenome.push(commonGenes[randomIndex]);
					commonGenes.splice(randomIndex, 1);

					continue;
				}
				
				//mutation to unused gene is supposed to be low
				var mutationToUnusedGene = unusedGeneInheritance >= 0.5 ? (Math.random() < unusedGeneInheritance) :
										   !(Math.random() > unusedGeneInheritance);

				if(unusedGenes.length != 0) 
					mutationToUnusedGene = false;

				if(mutationToUnusedGene) {
					pushMutatedGene(mutationToUnusedGene, unusedGenes, uncommonGenes);
				} else {

					if(uncommonGenes.length == 0) {
						childGenome.push(commonGenes[randomIndex]);
						childGenome.splice(randomIndex, 1);
						continue;
					}

					pushMutatedGene(mutationToUnusedGene, unusedGenes, uncommonGenes);
				}
			} 

			return childGenome;

		},

		getFittestIndividual: function(populationArray) {
			var fittest = populationArray[0],
				_tempArray = [];

			for(var i = 1; i < populationArray.length; i++) {

				if(fittest.fitness < populationArray[i].fitness)
					fittest = populationArray[i];
				
				else if(fittest.fitness == populationArray[i].fitness)
					_tempArray.push(populationArray[i]);
				
			}
				
			console.log(_tempArray);
			return fittest;
		},

		//creates random genome from random coordinates
		createRandGenome: function() {
			var genome = [];
			for(var i = 0; i < this.genomeLength; i++) {
				var randomIndex = Math.floor(Math.random() * (main.randomPoints.length));

				//to not have two of the same gene, change the index to something elese
				while(genome.indexOf(main.randomPoints[randomIndex]) > -1)
					randomIndex = Math.floor(Math.random() * (main.randomPoints.length));
				
				genome.push(main.randomPoints[randomIndex]);
			}

			return genome;
		},

		indexOfObjectCoordinates: function(array, object) {
			for(var i = 0; i < array.length; i++)
				if(array[i]['x'] == object['x'] && array[i]['y'] == object['y'])
					return i;

			return -1;
		},

		createGeneration: function() {

		}
	},

	//calculates the sum of distances FROM THE MAIN NODE
	calculateSumOfDistances: function(randomPoints) {
		var distanceSum = 0,
		distanceFromNode = [];
		
		for(var i = 0; i < randomPoints.length; i++) {
			distanceSum += this.calculateDistance(this.mainCoordinate, randomPoints[i]);
			distanceFromNode.push({
				x: randomPoints[i].x,
				y: randomPoints[i].y,
				distance: this.calculateDistance(this.mainCoordinate, randomPoints[i])
			});
		}

		
		return distanceSum;
	},

	calculateDistance: function(point1, point2) {
		var deltaX = Math.abs(point1.x - point2.x),
			deltaY = Math.abs(point1.y - point2.y);

		return Math.sqrt(Math.pow(deltaX, 2), Math.pow(deltaY, 2));
	},

	renderConnections: function(canvas) {
		canvas.beginPath();

		//draws the main center node
		canvas.fillRect(main.mainCoordinate.x + (main.canvasObject.width/2) - main.nodeWidth/2, 
						main.mainCoordinate.y + (main.canvasObject.width/2) - main.nodeHeight/2,
						main.nodeWidth, 
						main.nodeHeight);

		canvas.fillStyle = 'orange';
		canvas.fillRect(main.canvasObject.width/2, 0, 1, main.canvasObject.height);
		canvas.fillRect(0, main.canvasObject.height/2, main.canvasObject.width, 1);


		//canvas.closePath();


		for(var i = 0; i < main.randomPoints.length; i++) {
			canvas.fillStyle = "black";
			//draw the random nodes
			//the random nodes have a width and height 10 less than the main node
			canvas.fillRect(main.randomPoints[i].x + (main.canvasObject.width/2) - (main.nodeWidth-10)/2,
							main.randomPoints[i].y + (main.canvasObject.height/2) - (main.nodeHeight-10)/2,
							main.nodeWidth - 10,
							main.nodeHeight - 10);
			
			canvas.beginPath();

			//draw line from the center node to the random node
			canvas.moveTo(main.mainCoordinate.x + (main.canvasObject.width/2), 
						  main.mainCoordinate.y + (main.canvasObject.height/2));

			canvas.lineTo(main.randomPoints[i].x + (main.canvasObject.width/2), 
						  main.randomPoints[i].y + (main.canvasObject.height/2));

			//prints the distance between main node and random point
			if(main.printDistance)
				canvas.fillText("" + main.calulateDistance(main.mainCoordinate, main.randomPoints[i]), 
								(main.mainCoordinate.x + main.randomPoints[i].x)/2 + (main.canvasObject.width/2) + 3,
								(main.mainCoordinate.y + main.randomPoints[i].y)/2 + (main.canvasObject.height/2) + 2);

			canvas.stroke();
			
		}
	}

};

main.init();


Array.prototype.indexOfObject = function(object) {
		for(var i = 0; i < this.length; i++) {

			if(Object.keys(this).length != Object.keys(object).length)
				continue;

			for(var property in this) {
				if(property != object[property])
					continue;
				else if(typeof property == 'object')
					throw Error("Cannot be used for nested objects!");
			}


			//if it was able to get past continue statement and equality loops,
			//it is equal, so return index
			return i;
		}

		return -1;
}
