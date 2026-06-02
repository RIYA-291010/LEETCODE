class Solution {
    public static boolean searchMatrix(int[][] matrix, int target) {
        int flag=0;
        int tot_rows=matrix.length;
        int tot_cols=matrix[0].length;
        for(int i=0;i<tot_rows;i++){
            for(int j=0;j<tot_cols;j++){
                if(matrix[i][j]==target){
                    flag=1;
                }
            }
        }
        if(flag==1){
            return true;
        }else{
            return false;
        }
        
    }
    public static void main(String args[]){
        Scanner sc=new Scanner(System.in);
        int m=sc.nextInt();
        int n=sc.nextInt();
        int matrix[][]=new int[m][n];
        int target=sc.nextInt();
        for(int i=0;i<m;i++){
            for(int j=0;j<n;j++){
                matrix[i][j]=sc.nextInt();
            }
        }
        System.out.println(searchMatrix(matrix,target));
    }
}
