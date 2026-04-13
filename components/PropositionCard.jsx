import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function PropositionCard({ title, imageUrl }) {
    return (
        <Card className="overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="p-0">
                <img src={imageUrl} alt={title} className="w-full h-48 object-cover"/>
            </CardHeader>
            <CardContent className="p-4">
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardContent>
        </Card>
    );
}