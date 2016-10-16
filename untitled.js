function crossoverParents(parent1, parent2) {
	if(parent1.genome.length != parent.genome.length)
		throw Error("Parent 1 and 2 do not have equivalent genome lengths!");

	var commonGenes = [],
		uncommonGenes = [],
		unusedGenes = main.randomPoints,
		
		childGenome = [],
		genomeLength = parent1.genome.length,
		
		indexOfCoords = main.genetics.indexOfObjectCoordinates;

		for(var i = 0; i < genomeLength; i++) {
			var par2 = parent2.genome[i];

			var index = indexOfCoords(parent1.genome, par2),
				indexUnused = indexOfCoords(unusedGenes, par2);

			if(index != -1) 
				commonGenes.push(par2);
			else 
				uncommonGenes.push(par2);

			unusedGenes.splice(indexUnused, 1);
		}

		function pushMutatedGene(mutationToUnusedGene, unusedGenes, uncommonGenes) {
			var genePoolChoice = mutationToUnusedGene ? unusedGenes : uncommonGenes,
				randomIndex = Math.random() * (genePoolChoice.length+1);

			childGenome.push(uncommonGenes[randomIndex]);
			uncommonGenes.splice(randomIndex, 1);
		}

		var mutationProbability = 0.25,
			unusedGeneInheritance = 0.3;

		for(var i = 0; i < genomeLength; i++) {
			var probability = (Math.random() > mutationProbability) && commonGenes.length != 0;
			
			if(probability) {
				var randomIndex = Math.random() * (commonGenes.length + 1);
				
				childGenome.push(commonGenes[randomIndex]);
				commonGenes.splice(randomIndex, 1);

				continue;
			}
			
			//mutation to unused gene is supposed to be low
			var mutationToUnusedGene = unusedGenesInheritance >= 0.5 ? (Math.random() < unusedGenesInheritance) :
									   !(Math.random() > unusedGenesInheritance);

			if(unusedGenes.length != 0) 
				mutationToUnusedGene = false;

			if(mutationToUnusedGene)
				pushMutatedGene(mutationToUnusedGene, unusedGenes, uncommonGenes);
			
			else {

				if(uncommonGenes.length == 0) {
					childGenome.push(commonGenes[randomIndex)]);
					childGenome.splice(randomIndex, 1);
					continue;
				}

				pushMutatedGene(mutationToUnusedGene, unusedGenes, uncommonGenes);
			}
		}

}
