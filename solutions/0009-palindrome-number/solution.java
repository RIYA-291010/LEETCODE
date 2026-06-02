class Solution {
    public static boolean isPalindrome(int x) {
        int rev=0;
        int ognum=x;
        while(x>0){
            int ld=x%10;
            rev= (rev*10)+ld;
            x=x/10;

        }
        if(rev==ognum){
            return true;
        }else{
            return false;
        }
        
    }
    public static void main(String args[]){
        Scanner sc= new Scanner(System.in);
        int num=sc.nextInt();
        System.out.println(isPalindrome(num));
    }
}
