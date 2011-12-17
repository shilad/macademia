import clusters
import utils

def make_full_interest_graph(interest):
    cluster_map = clusters.make_interest_graph(interest)

if __name__ == '__main__':
    utils.init()
    interest = utils.getInterestByName('politics')
    make_full_interest_graph(interest)
