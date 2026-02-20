-- Mise à jour du contenu du premier chapitre avec un contenu HTML structuré
UPDATE course_chapters
SET content = '
<h2>Introduction à la poésie médiévale</h2>
<p>La poésie du Moyen Âge représente un moment fondamental dans l''histoire littéraire française. Elle se caractérise par une grande diversité de formes et de thèmes, allant des chansons de geste aux poèmes courtois.</p>

<blockquote>
<p><strong>Définition :</strong> La poésie médiévale désigne l''ensemble des productions poétiques composées en langue d''oïl et en langue d''oc entre le XIe et le XVe siècle.</p>
</blockquote>

<h2>Les principales formes poétiques</h2>

<h3>La chanson de geste</h3>
<p>Les chansons de geste sont des poèmes épiques qui célèbrent les exploits de héros légendaires. Elles présentent plusieurs caractéristiques importantes :</p>

<ul>
<li>Composition en laisses assonancées (vers regroupés par strophes)</li>
<li>Utilisation du décasyllabe comme mètre principal</li>
<li>Thématiques guerrières et chevaleresques</li>
<li>Transmission orale avant la mise par écrit</li>
</ul>

<p>L''exemple le plus célèbre reste <em>La Chanson de Roland</em>, composée vers 1100, qui narre la bataille de Roncevaux.</p>

<h3>La poésie courtoise</h3>
<p>Au XIIe siècle, la poésie courtoise se développe dans le sud de la France avec les troubadours, puis se diffuse au nord avec les trouvères.</p>

<p>Les principaux thèmes abordés sont :</p>
<ol>
<li>L''amour courtois (<em>fin''amor</em>)</li>
<li>La dame inaccessible</li>
<li>Le service amoureux</li>
<li>La souffrance du poète</li>
</ol>

<h2>L''évolution vers la Renaissance</h2>
<p>Aux XIVe et XVe siècles, la poésie connaît une transformation progressive. Des poètes comme Guillaume de Machaut et François Villon renouvellent les formes et les thèmes.</p>

<blockquote>
<p><strong>À retenir :</strong> La poésie médiévale pose les fondations de la poésie française moderne, tant dans ses formes que dans ses thématiques.</p>
</blockquote>

<h3>Les formes fixes</h3>
<p>Cette période voit l''apparition et la codification de formes poétiques qui perdureront :</p>

<ul>
<li><strong>Le rondeau</strong> : poème à forme fixe avec un refrain</li>
<li><strong>La ballade</strong> : trois strophes suivies d''un envoi</li>
<li><strong>Le virelai</strong> : alternance de refrains et de couplets</li>
</ul>

<h2>Conclusion</h2>
<p>La poésie médiévale constitue un patrimoine littéraire d''une richesse exceptionnelle. Elle témoigne de l''évolution de la langue française et des préoccupations de la société médiévale, tout en posant les bases de la poésie moderne.</p>
'
WHERE id = 'f94da7df-5166-4a74-95c4-d29cf75806a6';
