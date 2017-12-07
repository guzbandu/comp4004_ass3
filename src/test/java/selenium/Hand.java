package selenium;

import java.util.ArrayList;
import java.util.List;

public class Hand {
	private List<Card> faceDown;
	private List<Card> showing;

	public Hand() {
		faceDown = new ArrayList<Card>();
		showing = new ArrayList<Card>();
	}
	
	public void addCard(String rank, String suit) {
		if (rank == null || rank.length() == 0 || 
				suit == null || suit.length() == 0) {
			faceDown.add(new Card("", ""));
		}
		else {
			showing.add(new Card(rank, suit));
		}
	}
	
	public void addCard(Card card) {
		if (card.getRank().equals("") && card.getSuit().equals("")) {
			faceDown.add(card);
		}
		else {
			showing.add(card);
		}
	}
	
	public int numCardsFaceDown() {
		return faceDown.size();
	}
	
	public int numCardsShowing() {
		return showing.size();
	}
	
	public Card getShowingCard(int i) {
		return showing.get(i);
	}
	
	public boolean contains(Card card) {
		for(int i=0; i<showing.size(); i++) {
			//System.out.println(showing.get(i).getRank() + card.getRank() + showing.get(i).getSuit() + card.getSuit());
			if(showing.get(i).getRank().equals(card.getRank()) && showing.get(i).getSuit().equals(card.getSuit()))
				return true;
		}
		return false;
	}

}
